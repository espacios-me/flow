import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

// Enable CORS
app.use("*", cors());

// Health check
app.get("/health", (c) => {
  return c.json({ status: "ok", service: "flow-atom-secondbrain" });
});

// Atom Dashboard Route
app.get("/atom-dash", async (c) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Atom — Your Second Brain</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
          min-height: 100vh;
          color: #fff;
          overflow-x: hidden;
        }
        
        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        
        .header {
          text-align: center;
          margin-bottom: 60px;
        }
        
        .logo-container {
          width: 200px;
          height: 200px;
          margin: 0 auto 30px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
        }
        
        .atom-logo {
          width: 150px;
          height: 150px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 80px;
          font-weight: bold;
          box-shadow: 0 0 40px rgba(102, 126, 234, 0.5);
        }
        
        h1 {
          font-size: 3.5rem;
          margin-bottom: 10px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .subtitle {
          font-size: 1.2rem;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 40px;
        }
        
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
          margin-bottom: 40px;
        }
        
        .card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .card:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.4);
          transform: translateY(-5px);
          box-shadow: 0 12px 40px rgba(102, 126, 234, 0.5);
        }
        
        .card-icon {
          font-size: 2.5rem;
          margin-bottom: 15px;
        }
        
        .card h3 {
          font-size: 1.3rem;
          margin-bottom: 10px;
        }
        
        .card p {
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
        }
        
        .status-badge {
          display: inline-block;
          background: rgba(102, 126, 234, 0.3);
          border: 1px solid rgba(102, 126, 234, 0.6);
          color: #667eea;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.85rem;
          margin-top: 15px;
        }
        
        .loading {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: #667eea;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .footer {
          text-align: center;
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.9rem;
          margin-top: 60px;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-container">
            <div class="atom-logo">⚛️</div>
          </div>
          <h1>Atom</h1>
          <p class="subtitle">Your Personal AI Second Brain</p>
        </div>
        
        <div class="dashboard-grid">
          <div class="card">
            <div class="card-icon">📧</div>
            <h3>Email Intelligence</h3>
            <p>Analyze your emails to understand communication patterns and extract key insights.</p>
            <div class="status-badge"><span class="loading"></span> Initializing...</div>
          </div>
          
          <div class="card">
            <div class="card-icon">📁</div>
            <h3>Document Memory</h3>
            <p>Index your Google Drive files and extract knowledge from your documents.</p>
            <div class="status-badge"><span class="loading"></span> Initializing...</div>
          </div>
          
          <div class="card">
            <div class="card-icon">📋</div>
            <h3>Task Intelligence</h3>
            <p>Track your Linear issues and understand your project workflows.</p>
            <div class="status-badge"><span class="loading"></span> Initializing...</div>
          </div>
          
          <div class="card">
            <div class="card-icon">🚀</div>
            <h3>Deployment Tracking</h3>
            <p>Monitor your Vercel deployments and build performance metrics.</p>
            <div class="status-badge"><span class="loading"></span> Initializing...</div>
          </div>
          
          <div class="card">
            <div class="card-icon">🧠</div>
            <h3>Context Engine</h3>
            <p>AI-powered analysis using Claude and OpenAI to understand you deeply.</p>
            <div class="status-badge"><span class="loading"></span> Initializing...</div>
          </div>
          
          <div class="card">
            <div class="card-icon">💬</div>
            <h3>Chat Interface</h3>
            <p>Ask Atom questions about yourself and get personalized insights.</p>
            <div class="status-badge"><span class="loading"></span> Coming Soon</div>
          </div>
        </div>
        
        <div class="footer">
          <p>Atom v1.0 — Powered by Cloudflare Workers</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return c.html(html);
});

// Atom Roadmap Route
app.get("/atom-roadmap", async (c) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Atom Roadmap</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
          min-height: 100vh;
          color: #fff;
        }
        
        .container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 60px 20px;
        }
        
        h1 {
          text-align: center;
          font-size: 3rem;
          margin-bottom: 50px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .timeline {
          position: relative;
          padding: 20px 0;
        }
        
        .timeline::before {
          content: '';
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          width: 2px;
          height: 100%;
          background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
        }
        
        .timeline-item {
          margin-bottom: 50px;
          width: 45%;
        }
        
        .timeline-item:nth-child(odd) {
          margin-left: 0;
          text-align: right;
          padding-right: 50px;
        }
        
        .timeline-item:nth-child(even) {
          margin-left: 55%;
          text-align: left;
          padding-left: 50px;
        }
        
        .timeline-content {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 15px;
          padding: 25px;
          box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
        }
        
        .timeline-content h3 {
          font-size: 1.3rem;
          margin-bottom: 10px;
          color: #667eea;
        }
        
        .timeline-content p {
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.6;
        }
        
        .timeline-dot {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 20px;
          background: #667eea;
          border: 3px solid #0f0c29;
          border-radius: 50%;
          top: 30px;
        }
        
        @media (max-width: 768px) {
          .timeline::before {
            left: 20px;
          }
          
          .timeline-item {
            width: 100%;
            margin-left: 0 !important;
            padding-left: 60px !important;
            padding-right: 0 !important;
            text-align: left !important;
          }
          
          .timeline-dot {
            left: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Atom Development Roadmap</h1>
        
        <div class="timeline">
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <h3>Phase 1: Foundation</h3>
              <p>API setup, environment configuration, database schema, webhook handlers</p>
            </div>
          </div>
          
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <h3>Phase 2: Data Ingestion</h3>
              <p>Gmail, Google Drive, Linear, Vercel integrations with real-time sync</p>
            </div>
          </div>
          
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <h3>Phase 3: Context Engine</h3>
              <p>Claude/OpenAI analysis, profile building, pattern recognition</p>
            </div>
          </div>
          
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <h3>Phase 4: Dashboard UI</h3>
              <p>React web interface with glassmorphism design and 3D Atom logo</p>
            </div>
          </div>
          
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <h3>Phase 5: Native Apps</h3>
              <p>Electron desktop + React Native mobile applications</p>
            </div>
          </div>
          
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <h3>Phase 6: Health Monitoring</h3>
              <p>Error tracking, performance monitoring, uptime checks</p>
            </div>
          </div>
          
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <h3>Phase 7: Deployment</h3>
              <p>Cloudflare Workers/Pages, GitHub Actions CI/CD</p>
            </div>
          </div>
          
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <h3>Phase 8: Security</h3>
              <p>Rate limiting, encryption, audit logging, privacy controls</p>
            </div>
          </div>
          
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <h3>Phase 9: Testing & QA</h3>
              <p>Unit tests, integration tests, E2E tests, performance testing</p>
            </div>
          </div>
          
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <h3>Phase 10: Launch</h3>
              <p>Documentation, marketing, public release</p>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return c.html(html);
});

// Default route
app.get("/", (c) => {
  return c.redirect("/atom-dash");
});

export default app;
