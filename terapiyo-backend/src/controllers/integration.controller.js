import { validationResult } from 'express-validator';
import integrationService from '../services/integration.service.js';
import { ApiError } from '../utils/api-error.js';
import { catchAsync } from '../utils/catch-async.js';

class IntegrationController {
  /**
   * Integration endpoint'leri
   */
  createIntegration = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Doğrulama hatası', errors.array());
    }

    const integration = await integrationService.createIntegration({
      ...req.body,
      createdBy: req.user._id
    });

    res.status(201).json({
      status: 'success',
      data: integration
    });
  });

  getIntegration = catchAsync(async (req, res) => {
    const integration = await integrationService.getIntegration(
      req.params.integrationId
    );

    res.json({
      status: 'success',
      data: integration
    });
  });

  updateIntegration = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Doğrulama hatası', errors.array());
    }

    const integration = await integrationService.updateIntegration(
      req.params.integrationId,
      req.body
    );

    res.json({
      status: 'success',
      data: integration
    });
  });

  deleteIntegration = catchAsync(async (req, res) => {
    await integrationService.deleteIntegration(req.params.integrationId);

    res.json({
      status: 'success',
      data: null
    });
  });

  /**
   * API Key endpoint'leri
   */
  createApiKey = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Doğrulama hatası', errors.array());
    }

    const apiKey = await integrationService.createApiKey({
      ...req.body,
      user: req.user._id
    });

    res.status(201).json({
      status: 'success',
      data: apiKey
    });
  });

  revokeApiKey = catchAsync(async (req, res) => {
    await integrationService.revokeApiKey(req.params.keyId);

    res.json({
      status: 'success',
      data: null
    });
  });

  /**
   * Webhook endpoint'leri
   */
  handleWebhook = catchAsync(async (req, res) => {
    const { integrationId } = req.params;
    const event = req.headers['x-webhook-event'];
    const signature = req.headers['x-webhook-signature'];

    await integrationService.handleWebhook(
      integrationId,
      event,
      req.body,
      signature
    );

    res.json({
      status: 'success',
      data: null
    });
  });

  /**
   * API Metrics endpoint'leri
   */
  getApiMetrics = catchAsync(async (req, res) => {
    const metrics = await integrationService.getApiMetrics(req.query);

    res.json({
      status: 'success',
      data: metrics
    });
  });

  /**
   * Integration Dashboard endpoint'i
   */
  getIntegrationDashboard = catchAsync(async (req, res) => {
    const [
      integrations,
      apiKeys,
      webhookEvents,
      apiMetrics
    ] = await Promise.all([
      integrationService.getActiveIntegrations(),
      integrationService.getActiveApiKeys(req.user._id),
      integrationService.getRecentWebhookEvents(),
      integrationService.getApiMetrics({
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000)
      })
    ]);

    res.json({
      status: 'success',
      data: {
        integrations: {
          total: integrations.length,
          byProvider: this.groupByProvider(integrations),
          byStatus: this.groupByStatus(integrations)
        },
        apiKeys: {
          total: apiKeys.length,
          active: apiKeys.filter(key => key.status === 'active').length
        },
        webhooks: {
          total: webhookEvents.length,
          byStatus: this.groupByStatus(webhookEvents)
        },
        apiMetrics
      }
    });
  });

  /**
   * Yardımcı metodlar
   */
  groupByProvider(integrations) {
    return integrations.reduce((acc, integration) => {
      acc[integration.provider] = (acc[integration.provider] || 0) + 1;
      return acc;
    }, {});
  }

  groupByStatus(items) {
    return items.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});
  }
}

export default new IntegrationController();
