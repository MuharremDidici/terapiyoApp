import {
  Workflow,
  WorkflowInstance,
  ApprovalTask
} from '../models/workflow.model.js';
import { ApiError } from '../utils/api-error.js';
import logger from '../config/logger.js';
import { redis } from '../config/database.js';
import { executeStep } from '../utils/workflow-executor.js';
import { evaluateCondition } from '../utils/condition-evaluator.js';
import { EventEmitter } from 'events';

class WorkflowService {
  constructor() {
    this.eventEmitter = new EventEmitter();
    this.setupEventListeners();
  }

  /**
   * Workflow İşlemleri
   */
  async createWorkflow(data) {
    try {
      const workflow = new Workflow(data);
      await workflow.save();

      // Önbelleği güncelle
      await this.updateWorkflowCache(workflow);

      return workflow;
    } catch (error) {
      logger.error('İş akışı oluşturma hatası:', error);
      throw error;
    }
  }

  async updateWorkflow(workflowId, updates) {
    try {
      const workflow = await Workflow.findById(workflowId);
      if (!workflow) {
        throw new ApiError(404, 'İş akışı bulunamadı');
      }

      // Yeni versiyon oluştur
      const newVersion = await workflow.createNewVersion();
      Object.assign(newVersion, updates);
      await newVersion.save();

      // Önbelleği güncelle
      await this.updateWorkflowCache(newVersion);

      return newVersion;
    } catch (error) {
      logger.error('İş akışı güncelleme hatası:', error);
      throw error;
    }
  }

  async activateWorkflow(workflowId) {
    try {
      const workflow = await Workflow.findById(workflowId);
      if (!workflow) {
        throw new ApiError(404, 'İş akışı bulunamadı');
      }

      await workflow.activate();

      // Event listener'ı kaydet
      this.registerWorkflowTrigger(workflow);

      return workflow;
    } catch (error) {
      logger.error('İş akışı aktivasyon hatası:', error);
      throw error;
    }
  }

  /**
   * Workflow Instance İşlemleri
   */
  async startWorkflow(workflowId, triggerData) {
    try {
      const workflow = await Workflow.findById(workflowId);
      if (!workflow) {
        throw new ApiError(404, 'İş akışı bulunamadı');
      }

      // Tetikleyici koşullarını kontrol et
      if (!this.evaluateTriggerConditions(workflow.trigger, triggerData)) {
        throw new ApiError(400, 'Tetikleyici koşulları sağlanmıyor');
      }

      const instance = new WorkflowInstance({
        workflow: workflow._id,
        trigger: {
          event: workflow.trigger.event,
          data: triggerData
        },
        variables: this.initializeVariables(workflow.variables)
      });

      await instance.start();
      await this.executeWorkflow(instance);

      return instance;
    } catch (error) {
      logger.error('İş akışı başlatma hatası:', error);
      throw error;
    }
  }

  async executeWorkflow(instance) {
    try {
      const workflow = await Workflow.findById(instance.workflow);
      const steps = workflow.steps;

      while (instance.currentStep.index < steps.length) {
        const step = steps[instance.currentStep.index];
        const stepInstance = instance.steps[instance.currentStep.index];

        try {
          stepInstance.status = 'running';
          stepInstance.startTime = new Date();
          await instance.save();

          const output = await this.executeStep(step, instance);

          stepInstance.status = 'completed';
          stepInstance.endTime = new Date();
          stepInstance.output = output;
          instance.currentStep.index++;
          await instance.save();

        } catch (error) {
          stepInstance.status = 'failed';
          stepInstance.endTime = new Date();
          stepInstance.error = {
            code: error.code || 'STEP_EXECUTION_ERROR',
            message: error.message,
            stack: error.stack
          };

          if (step.errorHandling.continueOnError) {
            instance.currentStep.index++;
            await instance.save();
            continue;
          }

          await instance.fail(error, instance.currentStep.index);
          throw error;
        }
      }

      await instance.complete();
    } catch (error) {
      logger.error('İş akışı yürütme hatası:', error);
      throw error;
    }
  }

  /**
   * Onay Görevi İşlemleri
   */
  async createApprovalTask(instance, step, config) {
    try {
      const task = new ApprovalTask({
        instance: instance._id,
        step: instance.currentStep.index,
        type: config.type,
        approvers: config.approvers.map(userId => ({
          user: userId,
          status: 'pending'
        })),
        requiredApprovals: config.requiredApprovals,
        requiredPercentage: config.requiredPercentage,
        deadline: config.deadline
      });

      await task.save();
      return task;
    } catch (error) {
      logger.error('Onay görevi oluşturma hatası:', error);
      throw error;
    }
  }

  async handleApproval(taskId, userId, action, comment) {
    try {
      const task = await ApprovalTask.findById(taskId);
      if (!task) {
        throw new ApiError(404, 'Onay görevi bulunamadı');
      }

      if (action === 'approve') {
        await task.approve(userId, comment);
      } else {
        await task.reject(userId, comment);
      }

      if (['approved', 'rejected'].includes(task.status)) {
        const instance = await WorkflowInstance.findById(task.instance);
        if (task.status === 'approved') {
          instance.currentStep.index++;
          await instance.save();
          await this.executeWorkflow(instance);
        } else {
          await instance.fail(new Error('Onay reddedildi'), task.step);
        }
      }

      return task;
    } catch (error) {
      logger.error('Onay işleme hatası:', error);
      throw error;
    }
  }

  /**
   * Event Handling
   */
  setupEventListeners() {
    // Aktif iş akışlarını yükle ve dinleyicileri kaydet
    this.loadActiveWorkflows();

    // Zamanlanmış görevleri kontrol et
    setInterval(() => this.checkScheduledTasks(), 60000);
  }

  async loadActiveWorkflows() {
    try {
      const workflows = await Workflow.find({ status: 'active' });
      for (const workflow of workflows) {
        this.registerWorkflowTrigger(workflow);
      }
    } catch (error) {
      logger.error('Aktif iş akışları yükleme hatası:', error);
    }
  }

  registerWorkflowTrigger(workflow) {
    this.eventEmitter.on(workflow.trigger.event, async (data) => {
      try {
        if (this.evaluateTriggerConditions(workflow.trigger, data)) {
          await this.startWorkflow(workflow._id, data);
        }
      } catch (error) {
        logger.error('İş akışı tetikleme hatası:', error);
      }
    });
  }

  /**
   * Yardımcı Metodlar
   */
  evaluateTriggerConditions(trigger, data) {
    if (!trigger.conditions || trigger.conditions.length === 0) {
      return true;
    }

    return trigger.conditions.every(condition =>
      evaluateCondition(data[condition.field], condition.operator, condition.value)
    );
  }

  initializeVariables(variables) {
    const initializedVars = new Map();
    if (variables) {
      for (const [key, config] of variables.entries()) {
        initializedVars.set(key, config.defaultValue);
      }
    }
    return initializedVars;
  }

  async executeStep(step, instance) {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Step timeout')), step.timeout)
    );

    try {
      return await Promise.race([
        executeStep(step, instance),
        timeout
      ]);
    } catch (error) {
      if (step.errorHandling.fallbackAction === 'retry' &&
          instance.currentStep.retryCount < step.retryConfig.maxAttempts) {
        instance.currentStep.retryCount++;
        const delay = step.retryConfig.initialDelay *
          Math.pow(step.retryConfig.backoffMultiplier, instance.currentStep.retryCount - 1);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.executeStep(step, instance);
      }
      throw error;
    }
  }

  async updateWorkflowCache(workflow) {
    const key = `workflow:${workflow._id}`;
    await redis.set(key, JSON.stringify(workflow), 'EX', 3600);
  }

  async checkScheduledTasks() {
    try {
      const tasks = await ApprovalTask.find({
        status: 'pending',
        deadline: { $lte: new Date() }
      });

      for (const task of tasks) {
        task.status = 'expired';
        await task.save();

        const instance = await WorkflowInstance.findById(task.instance);
        await instance.fail(new Error('Onay süresi doldu'), task.step);
      }
    } catch (error) {
      logger.error('Zamanlanmış görev kontrolü hatası:', error);
    }
  }
}

export default new WorkflowService();
