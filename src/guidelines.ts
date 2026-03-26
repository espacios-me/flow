export function getGuidelinesHTML(): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>UI Guidelines — Atom</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #000;
          color: #fff;
          line-height: 1.6;
        }
        
        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 60px 20px;
        }
        
        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 80px;
          padding-bottom: 20px;
          border-bottom: 2px solid #00FF00;
        }
        
        .logo {
          font-size: 1.5rem;
          font-weight: bold;
          color: #fff;
        }
        
        nav {
          display: flex;
          gap: 30px;
        }
        
        nav a {
          color: #fff;
          text-decoration: none;
          transition: color 0.3s ease;
        }
        
        nav a:hover {
          color: #00FF00;
        }
        
        h1 {
          font-size: 3.5rem;
          margin-bottom: 20px;
          font-weight: bold;
        }
        
        h2 {
          font-size: 2.5rem;
          margin-top: 80px;
          margin-bottom: 30px;
          color: #00FF00;
          border-bottom: 2px solid #00FF00;
          padding-bottom: 15px;
        }
        
        h3 {
          font-size: 1.5rem;
          margin-top: 30px;
          margin-bottom: 15px;
          color: #fff;
        }
        
        p {
          color: #a0a0a0;
          margin-bottom: 15px;
          font-size: 1rem;
        }
        
        .section {
          margin-bottom: 60px;
        }
        
        .color-palette {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin: 30px 0;
        }
        
        .color-box {
          border: 2px solid #00FF00;
          padding: 20px;
          text-align: center;
          background: #1a1a1a;
        }
        
        .color-swatch {
          width: 100%;
          height: 80px;
          margin-bottom: 15px;
          border: 1px solid #00FF00;
        }
        
        .color-name {
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .color-hex {
          font-size: 0.9rem;
          color: #00FF00;
          font-family: monospace;
        }
        
        .component-example {
          background: #1a1a1a;
          border: 2px solid #00FF00;
          padding: 30px;
          margin: 20px 0;
          display: flex;
          gap: 20px;
          align-items: center;
          flex-wrap: wrap;
        }
        
        .button-primary {
          background: #fff;
          color: #000;
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .button-primary:hover {
          transform: scale(1.05);
          opacity: 0.9;
        }
        
        .button-secondary {
          background: transparent;
          color: #00FF00;
          padding: 12px 24px;
          border: 2px solid #00FF00;
          border-radius: 6px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .button-secondary:hover {
          background: #00FF00;
          color: #000;
          transform: scale(1.05);
        }
        
        .card-example {
          background: #1a1a1a;
          border: 2px solid #00FF00;
          padding: 30px;
          max-width: 300px;
        }
        
        .card-number {
          font-size: 2rem;
          color: #00FF00;
          font-weight: bold;
          margin-bottom: 10px;
        }
        
        .card-title {
          font-size: 1.3rem;
          font-weight: bold;
          margin-bottom: 10px;
        }
        
        .card-description {
          color: #a0a0a0;
          font-size: 0.95rem;
        }
        
        .typography-example {
          background: #1a1a1a;
          border: 2px solid #00FF00;
          padding: 30px;
          margin: 20px 0;
        }
        
        .typography-example h4 {
          font-size: 1.1rem;
          color: #00FF00;
          margin-bottom: 10px;
          font-weight: bold;
        }
        
        .typography-example p {
          margin-bottom: 20px;
        }
        
        .hero-example {
          background: #000;
          border: 2px solid #00FF00;
          padding: 60px 40px;
          text-align: center;
          margin: 20px 0;
        }
        
        .hero-example h3 {
          font-size: 3rem;
          margin-bottom: 20px;
          color: #fff;
        }
        
        .hero-example p {
          font-size: 1.1rem;
          margin-bottom: 30px;
        }
        
        .spacing-example {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin: 20px 0;
        }
        
        .spacing-box {
          background: #1a1a1a;
          border: 2px solid #00FF00;
          padding: 20px;
          text-align: center;
        }
        
        .spacing-visual {
          background: #00FF00;
          margin-bottom: 10px;
        }
        
        .spacing-small .spacing-visual {
          height: 20px;
        }
        
        .spacing-medium .spacing-visual {
          height: 40px;
        }
        
        .spacing-large .spacing-visual {
          height: 60px;
        }
        
        .spacing-xl .spacing-visual {
          height: 100px;
        }
        
        .code-block {
          background: #1a1a1a;
          border: 2px solid #00FF00;
          padding: 20px;
          margin: 20px 0;
          overflow-x: auto;
          font-family: 'Courier New', monospace;
          font-size: 0.9rem;
          color: #00FF00;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        
        th, td {
          border: 1px solid #00FF00;
          padding: 12px;
          text-align: left;
        }
        
        th {
          background: #1a1a1a;
          color: #00FF00;
          font-weight: bold;
        }
        
        td {
          color: #a0a0a0;
        }
        
        .do-dont {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin: 20px 0;
        }
        
        .do, .dont {
          border: 2px solid;
          padding: 20px;
          background: #1a1a1a;
        }
        
        .do {
          border-color: #00FF00;
        }
        
        .dont {
          border-color: #ff0000;
        }
        
        .do h4, .dont h4 {
          margin-bottom: 10px;
          font-weight: bold;
        }
        
        .do h4 {
          color: #00FF00;
        }
        
        .dont h4 {
          color: #ff0000;
        }
        
        footer {
          margin-top: 100px;
          padding-top: 20px;
          border-top: 2px solid #00FF00;
          text-align: center;
          color: #a0a0a0;
        }
      </style>
    </head>
    <body>
      <header>
        <div class="logo">atom</div>
        <nav>
          <a href="/plan">Dashboard</a>
          <a href="/plan/roadmap">Roadmap</a>
          <a href="/guidelines">Guidelines</a>
          <a href="/logout">Sign Out</a>
        </nav>
      </header>
      
      <div class="container">
        <h1>UI Guidelines</h1>
        <p>Design system and component specifications for Atom — aligned with Espacios brand identity.</p>
        
        <!-- Color Palette Section -->
        <div class="section">
          <h2>Color Palette</h2>
          <p>Our color system is built on high contrast and neon accents for maximum visibility and modern aesthetics.</p>
          
          <div class="color-palette">
            <div class="color-box">
              <div class="color-swatch" style="background: #000;"></div>
              <div class="color-name">Black</div>
              <div class="color-hex">#000000</div>
              <p style="font-size: 0.85rem; margin-top: 10px;">Primary background</p>
            </div>
            
            <div class="color-box">
              <div class="color-swatch" style="background: #fff;"></div>
              <div class="color-name">White</div>
              <div class="color-hex">#FFFFFF</div>
              <p style="font-size: 0.85rem; margin-top: 10px;">Primary text & buttons</p>
            </div>
            
            <div class="color-box">
              <div class="color-swatch" style="background: #00FF00;"></div>
              <div class="color-name">Neon Green</div>
              <div class="color-hex">#00FF00</div>
              <p style="font-size: 0.85rem; margin-top: 10px;">Accents & highlights</p>
            </div>
            
            <div class="color-box">
              <div class="color-swatch" style="background: #a0a0a0;"></div>
              <div class="color-name">Gray</div>
              <div class="color-hex">#A0A0A0</div>
              <p style="font-size: 0.85rem; margin-top: 10px;">Secondary text</p>
            </div>
            
            <div class="color-box">
              <div class="color-swatch" style="background: #1a1a1a; border: 1px solid #00FF00;"></div>
              <div class="color-name">Dark Gray</div>
              <div class="color-hex">#1A1A1A</div>
              <p style="font-size: 0.85rem; margin-top: 10px;">Cards & containers</p>
            </div>
          </div>
        </div>
        
        <!-- Typography Section -->
        <div class="section">
          <h2>Typography</h2>
          <p>We use system fonts for optimal performance and readability across all devices.</p>
          
          <div class="typography-example">
            <h4>Font Family</h4>
            <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif</p>
            
            <h4 style="margin-top: 30px;">Heading (H1)</h4>
            <h1 style="font-size: 2.5rem; color: #fff; margin: 0;">Capture demand. Qualify instantly.</h1>
            
            <h4 style="margin-top: 30px;">Heading (H2)</h4>
            <h2 style="font-size: 2rem; color: #00FF00; border: none; margin: 0; padding: 0;">Color Palette</h2>
            
            <h4 style="margin-top: 30px;">Body Text</h4>
            <p>This is body text. It should be readable and clear. We use gray (#A0A0A0) for secondary information and white (#FFFFFF) for primary content.</p>
            
            <h4 style="margin-top: 30px;">Accent Text</h4>
            <p style="color: #00FF00;">This is accent text in neon green. Use for highlights, links, and important information.</p>
          </div>
        </div>
        
        <!-- Buttons Section -->
        <div class="section">
          <h2>Buttons</h2>
          <p>Two primary button styles for different contexts and user actions.</p>
          
          <div class="component-example">
            <button class="button-primary">Primary Button</button>
            <button class="button-secondary">Secondary Button</button>
          </div>
          
          <div class="do-dont">
            <div class="do">
              <h4>✓ Do</h4>
              <p>Use primary buttons for main actions (Submit, Continue, Get Started)</p>
              <p>Use secondary buttons for alternative actions (Cancel, Learn More)</p>
              <p>Ensure sufficient padding for touch targets (min 44px height)</p>
            </div>
            <div class="dont">
              <h4>✗ Don't</h4>
              <p>Don't use more than 2 button styles on one page</p>
              <p>Don't make buttons too small (less than 12px font)</p>
              <p>Don't use buttons for navigation (use links instead)</p>
            </div>
          </div>
        </div>
        
        <!-- Cards Section -->
        <div class="section">
          <h2>Cards</h2>
          <p>Cards are used to group related content and create visual hierarchy.</p>
          
          <div class="component-example">
            <div class="card-example">
              <div class="card-number">01</div>
              <div class="card-title">Lead Generation</div>
              <div class="card-description">Multi-channel campaigns that fill your pipeline with buyers across all platforms.</div>
            </div>
            
            <div class="card-example">
              <div class="card-number">02</div>
              <div class="card-title">Qualification</div>
              <div class="card-description">AI qualifies every lead instantly — budget, timeline, and intent captured automatically.</div>
            </div>
          </div>
          
          <h3>Card Specifications</h3>
          <table>
            <tr>
              <th>Property</th>
              <th>Value</th>
            </tr>
            <tr>
              <td>Background</td>
              <td>#1A1A1A</td>
            </tr>
            <tr>
              <td>Border</td>
              <td>2px solid #00FF00</td>
            </tr>
            <tr>
              <td>Padding</td>
              <td>20-40px</td>
            </tr>
            <tr>
              <td>Border Radius</td>
              <td>0-8px</td>
            </tr>
            <tr>
              <td>Box Shadow</td>
              <td>0 8px 32px rgba(0, 255, 0, 0.1)</td>
            </tr>
          </table>
        </div>
        
        <!-- Hero Section -->
        <div class="section">
          <h2>Hero Section</h2>
          <p>Large, bold sections used at the top of pages to grab attention.</p>
          
          <div class="hero-example">
            <h3>Capture demand.<br>Qualify instantly.<br>Follow up until conversion.</h3>
            <p>Espacios builds end-to-end acquisition infrastructure for real estate teams — powered by AI.</p>
            <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
              <button class="button-primary">Get Started</button>
              <button class="button-secondary">Learn More</button>
            </div>
          </div>
        </div>
        
        <!-- Spacing Section -->
        <div class="section">
          <h2>Spacing Scale</h2>
          <p>Consistent spacing creates visual harmony and improves readability.</p>
          
          <div class="spacing-example">
            <div class="spacing-box spacing-small">
              <div class="spacing-visual"></div>
              <p>Small<br>10-15px</p>
            </div>
            <div class="spacing-box spacing-medium">
              <div class="spacing-visual"></div>
              <p>Medium<br>20-30px</p>
            </div>
            <div class="spacing-box spacing-large">
              <div class="spacing-visual"></div>
              <p>Large<br>40-60px</p>
            </div>
            <div class="spacing-box spacing-xl">
              <div class="spacing-visual"></div>
              <p>Extra Large<br>80-100px</p>
            </div>
          </div>
        </div>
        
        <!-- Code Examples -->
        <div class="section">
          <h2>Code Examples</h2>
          <p>Reference implementations for common components.</p>
          
          <h3>Primary Button</h3>
          <div class="code-block">
&lt;button style="
  background: #fff;
  color: #000;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
"&gt;
  Click Me
&lt;/button&gt;
          </div>
          
          <h3>Card Component</h3>
          <div class="code-block">
&lt;div style="
  background: #1a1a1a;
  border: 2px solid #00FF00;
  padding: 30px;
  border-radius: 8px;
"&gt;
  &lt;h3 style="color: #fff;"&gt;Title&lt;/h3&gt;
  &lt;p style="color: #a0a0a0;"&gt;Description&lt;/p&gt;
&lt;/div&gt;
          </div>
        </div>
        
        <!-- Responsive Design -->
        <div class="section">
          <h2>Responsive Design</h2>
          <p>Our designs adapt seamlessly across all device sizes.</p>
          
          <table>
            <tr>
              <th>Breakpoint</th>
              <th>Screen Size</th>
              <th>Layout</th>
            </tr>
            <tr>
              <td>Mobile</td>
              <td>&lt; 768px</td>
              <td>Single column, full width</td>
            </tr>
            <tr>
              <td>Tablet</td>
              <td>768px - 1024px</td>
              <td>2-3 columns</td>
            </tr>
            <tr>
              <td>Desktop</td>
              <td>&gt; 1024px</td>
              <td>Full grid layout</td>
            </tr>
          </table>
        </div>
        
        <!-- Accessibility -->
        <div class="section">
          <h2>Accessibility</h2>
          <p>We design for everyone, ensuring our interfaces are inclusive and usable by all.</p>
          
          <h3>Guidelines</h3>
          <ul style="color: #a0a0a0; margin-left: 20px;">
            <li style="margin-bottom: 10px;">Maintain high contrast between text and background (WCAG AA standard)</li>
            <li style="margin-bottom: 10px;">Use minimum 16px font size for body text</li>
            <li style="margin-bottom: 10px;">Provide clear focus indicators for keyboard navigation</li>
            <li style="margin-bottom: 10px;">Don't rely solely on color to convey information</li>
            <li style="margin-bottom: 10px;">Use semantic HTML for screen readers</li>
            <li style="margin-bottom: 10px;">Test with keyboard navigation and screen readers</li>
          </ul>
        </div>
      </div>
      
      <footer>
        <p>&copy; 2025 Espacios. All rights reserved.</p>
      </footer>
    </body>
    </html>
  `;
}
