const winston = require('winston');
const { ElasticsearchTransport } = require('winston-elasticsearch');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Add Elasticsearch in production
if (process.env.NODE_ENV === 'production') {
  logger.add(new ElasticsearchTransport({
    level: 'info',
    clientOpts: { node: process.env.ELASTICSEARCH_URL }
  }));
}

// Metrics collection
class MetricsCollector {
  constructor() {
    this.metrics = {
      requests: {},
      errors: {},
      responseTime: [],
      activeUsers: new Set()
    };
  }

  trackRequest(req, res, duration) {
    const endpoint = `${req.method} ${req.route?.path || req.path}`;
    
    if (!this.metrics.requests[endpoint]) {
      this.metrics.requests[endpoint] = { count: 0, totalTime: 0 };
    }
    
    this.metrics.requests[endpoint].count++;
    this.metrics.requests[endpoint].totalTime += duration;
    this.metrics.responseTime.push(duration);
    
    // Keep only last 1000 response times
    if (this.metrics.responseTime.length > 1000) {
      this.metrics.responseTime.shift();
    }
  }

  trackError(error, req) {
    const errorType = error.name || 'UnknownError';
    
    if (!this.metrics.errors[errorType]) {
      this.metrics.errors[errorType] = 0;
    }
    
    this.metrics.errors[errorType]++;
    
    logger.error({
      message: error.message,
      stack: error.stack,
      url: req?.url,
      method: req?.method,
      userId: req?.user?._id
    });
  }

  trackUserActivity(userId) {
    this.metrics.activeUsers.add(userId.toString());
  }

  getStats() {
    const avgResponseTime = this.metrics.responseTime.length > 0
      ? this.metrics.responseTime.reduce((a, b) => a + b, 0) / this.metrics.responseTime.length
      : 0;

    return {
      requests: this.metrics.requests,
      errors: this.metrics.errors,
      avgResponseTime,
      activeUsers: this.metrics.activeUsers.size,
      uptime: process.uptime()
    };
  }
}

module.exports = { logger, MetricsCollector };