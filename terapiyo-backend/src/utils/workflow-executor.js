import { EventEmitter } from 'events';
import logger from '../config/logger.js';

/**
 * İş akışı yürütücü
 */
export class WorkflowExecutor extends EventEmitter {
  constructor(options = {}) {
    super();

    this.options = {
      maxRetries: options.maxRetries || 3,
      retryDelay: options.retryDelay || 1000,
      timeout: options.timeout || 30000,
      parallel: options.parallel || false
    };

    this.workflows = new Map();
    this.running = new Map();
  }

  /**
   * İş akışı tanımla
   */
  defineWorkflow(name, steps) {
    if (this.workflows.has(name)) {
      throw new Error(`Workflow ${name} already exists`);
    }

    this.workflows.set(name, steps);
  }

  /**
   * İş akışı çalıştır
   */
  async executeWorkflow(name, context = {}) {
    try {
      const steps = this.workflows.get(name);
      if (!steps) {
        throw new Error(`Workflow ${name} not found`);
      }

      const workflowId = this.#generateWorkflowId();
      const workflowContext = {
        id: workflowId,
        name,
        startTime: Date.now(),
        status: 'running',
        context,
        results: {}
      };

      this.running.set(workflowId, workflowContext);
      this.emit('workflowStart', { workflowId, name });

      // Adımları çalıştır
      if (this.options.parallel) {
        await this.#executeParallel(steps, workflowContext);
      } else {
        await this.#executeSequential(steps, workflowContext);
      }

      // İş akışı tamamlandı
      workflowContext.status = 'completed';
      workflowContext.endTime = Date.now();
      workflowContext.duration = workflowContext.endTime - workflowContext.startTime;

      this.emit('workflowComplete', {
        workflowId,
        name,
        results: workflowContext.results,
        duration: workflowContext.duration
      });

      return workflowContext;
    } catch (error) {
      logger.error('Workflow execution failed:', error);
      throw error;
    }
  }

  /**
   * İş akışı durumunu al
   */
  getWorkflowStatus(workflowId) {
    return this.running.get(workflowId);
  }

  /**
   * İş akışını durdur
   */
  async stopWorkflow(workflowId) {
    const workflow = this.running.get(workflowId);
    if (workflow && workflow.status === 'running') {
      workflow.status = 'stopped';
      this.emit('workflowStop', { workflowId, name: workflow.name });
    }
  }

  /**
   * Adımları sıralı çalıştır
   */
  async #executeSequential(steps, workflowContext) {
    for (const [stepName, step] of Object.entries(steps)) {
      try {
        const result = await this.executeStep(stepName, step, workflowContext);
        workflowContext.results[stepName] = result;

        // Adım tamamlandı
        this.emit('stepComplete', {
          workflowId: workflowContext.id,
          step: stepName,
          result
        });

        // İş akışı durdurulduysa çık
        if (workflowContext.status === 'stopped') {
          break;
        }
      } catch (error) {
        // Adım başarısız
        this.emit('stepError', {
          workflowId: workflowContext.id,
          step: stepName,
          error
        });

        throw error;
      }
    }
  }

  /**
   * Adımları paralel çalıştır
   */
  async #executeParallel(steps, workflowContext) {
    const promises = Object.entries(steps).map(([stepName, step]) =>
      this.executeStep(stepName, step, workflowContext)
        .then(result => {
          workflowContext.results[stepName] = result;
          this.emit('stepComplete', {
            workflowId: workflowContext.id,
            step: stepName,
            result
          });
          return result;
        })
        .catch(error => {
          this.emit('stepError', {
            workflowId: workflowContext.id,
            step: stepName,
            error
          });
          throw error;
        })
    );

    await Promise.all(promises);
  }

  /**
   * Adım çalıştır
   */
  async executeStep(stepName, step, workflowContext) {
    let lastError;
    for (let attempt = 1; attempt <= this.options.maxRetries; attempt++) {
      try {
        // Adım başladı
        this.emit('stepStart', {
          workflowId: workflowContext.id,
          step: stepName,
          attempt
        });

        // Adımı çalıştır
        const result = await Promise.race([
          step(workflowContext.context, workflowContext.results),
          this.#timeout(this.options.timeout)
        ]);

        return result;
      } catch (error) {
        lastError = error;
        logger.warn(`Step ${stepName} attempt ${attempt} failed:`, error);

        // Son deneme değilse bekle ve tekrar dene
        if (attempt < this.options.maxRetries) {
          await this.#sleep(this.options.retryDelay * attempt);
        }
      }
    }

    throw lastError;
  }

  /**
   * Timeout promise'i oluştur
   */
  #timeout(ms) {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Step timeout')), ms)
    );
  }

  /**
   * Belirli bir süre bekle
   */
  #sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Benzersiz iş akışı ID'si oluştur
   */
  #generateWorkflowId() {
    return `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * İş akışı yürütücü örneği oluştur
 */
export const workflowExecutor = new WorkflowExecutor();

export const executeStep = (stepName, step, context) => {
  return workflowExecutor.executeStep(stepName, step, context);
};

export const executeWorkflow = (name, context) => {
  return workflowExecutor.executeWorkflow(name, context);
};

export const getWorkflowStatus = (workflowId) => {
  return workflowExecutor.getWorkflowStatus(workflowId);
};

export const stopWorkflow = (workflowId) => {
  return workflowExecutor.stopWorkflow(workflowId);
};

export const createWorkflowExecutor = (options) => {
  return new WorkflowExecutor(options);
};

export default workflowExecutor;
