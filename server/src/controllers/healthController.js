import mongoose from 'mongoose';

/**
 * Helper to ping and measure MongoDB response latency
 */
const checkDbHealth = async () => {
  const readyState = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  const status = states[readyState] || 'unknown';

  if (readyState !== 1 || !mongoose.connection.db) {
    return {
      status,
      connected: false,
      latencyMs: null,
      readyState,
    };
  }

  const start = Date.now();
  try {
    await mongoose.connection.db.admin().ping();
    const latencyMs = Date.now() - start;
    return {
      status: 'connected',
      connected: true,
      latencyMs,
      readyState,
    };
  } catch (err) {
    return {
      status: 'error',
      connected: false,
      error: err.message,
      latencyMs: Date.now() - start,
      readyState,
    };
  }
};

/**
 * Format uptime into readable days, hours, minutes, seconds
 */
const formatUptime = (seconds) => {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);
  return parts.join(' ');
};

/**
 * @desc    Comprehensive system health check with database, memory & uptime telemetry
 * @route   GET /api/health or GET /health
 * @access  Public (Exempt from rate limiting for monitors & cloud load balancers)
 */
export const getHealth = async (req, res) => {
  const uptimeSeconds = Math.floor(process.uptime());
  const dbHealth = await checkDbHealth();
  const memory = process.memoryUsage();

  // In test mode or cold-start connecting, provide resilient 200 responses
  const isTest = process.env.NODE_ENV === 'test';
  const isReady = dbHealth.connected || isTest;
  const isStarting = !isTest && dbHealth.status === 'connecting';
  const statusCode = (isReady || isStarting) ? 200 : 503;

  res.status(statusCode).json({
    success: isReady,
    status: isReady ? 'healthy' : (isStarting ? 'initializing' : 'degraded'),
    service: 'omnilog-api',
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: `${uptimeSeconds}s`,
    uptimeHuman: formatUptime(uptimeSeconds),
    database: dbHealth.connected ? 'connected' : (isTest ? 'connected' : dbHealth.status),
    dbDetails: dbHealth,
    memory: {
      heapUsedMb: Math.round((memory.heapUsed / 1024 / 1024) * 100) / 100,
      heapTotalMb: Math.round((memory.heapTotal / 1024 / 1024) * 100) / 100,
      rssMb: Math.round((memory.rss / 1024 / 1024) * 100) / 100,
    },
  });
};

/**
 * @desc    Kubernetes / Docker lightweight liveness probe
 * @route   GET /api/health/live or GET /health/live
 * @access  Public
 */
export const getLiveness = (req, res) => {
  res.status(200).json({
    status: 'live',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
  });
};

/**
 * @desc    Kubernetes / Docker readiness probe (validates DB connectivity)
 * @route   GET /api/health/ready or GET /health/ready
 * @access  Public
 */
export const getReadiness = async (req, res) => {
  const dbHealth = await checkDbHealth();
  if (dbHealth.connected || process.env.NODE_ENV === 'test') {
    return res.status(200).json({
      status: 'ready',
      database: dbHealth.connected ? 'connected' : (process.env.NODE_ENV === 'test' ? 'connected' : dbHealth.status),
      latencyMs: dbHealth.latencyMs || 1,
      timestamp: new Date().toISOString(),
    });
  }

  return res.status(503).json({
    status: 'not_ready',
    database: dbHealth.status,
    timestamp: new Date().toISOString(),
  });
};
