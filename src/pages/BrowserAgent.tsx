import { useState } from 'react';
import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';
import { getThemeColor } from '../utils/theme';



const relatedPages: RelatedPage[] = [
 { id: 'tool-arch', label: '工具系统架构', description: 'Browser Agent 如何注册为工具' },
 { id: 'agent-loop', label: 'Agent 循环', description: '浏览器操作在 Agent Loop 中的位置' },
 { id: 'approval-mode', label: '审批模式', description: '浏览器操作的权限控制' },
 { id: 'policy-engine', label: 'Policy 策略引擎', description: '浏览器工具的策略配置' },
 { id: 'non-interactive', label: '非交互模式', description: '自动化场景中的浏览器代理' },
];

function Introduction({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
 return (
 <div className="mb-8 bg-surface rounded-lg border border-edge overflow-hidden">
 <button
 onClick={onToggle}
 className="w-full px-6 py-4 flex items-center justify-between hover:bg-elevated transition-colors"
 >
 <div className="flex items-center gap-3">
 <span className="text-2xl">🌐</span>
 <span className="text-xl font-bold text-heading">核心概念介绍</span>
 </div>
 <span className={`transform transition-transform text-dim ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
 </button>

 {isExpanded && (
 <div className="px-6 pb-6 space-y-4">
 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">🧪 实验性功能</h4>
 <p className="text-body text-sm">
 Browser Agent 是 Gemini CLI 的实验性功能，允许模型直接与 Web 页面进行交互。
 通过 Puppeteer 控制 Chrome/Chromium 浏览器实例，实现页面导航、元素操作、截图分析等自动化能力。
 </p>
 </div>

 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">🔧 典型使用场景</h4>
 <ul className="text-body text-sm space-y-1">
 <li><strong>网页信息提取</strong>：访问文档站点、抓取 API 文档内容</li>
 <li><strong>表单自动化</strong>：填写表单、提交数据、验证页面状态</li>
 <li><strong>UI 测试辅助</strong>：截图对比、元素存在性检查、交互流程验证</li>
 <li><strong>调试辅助</strong>：访问本地开发服务器、检查页面渲染结果</li>
 </ul>
 </div>

 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">🏗️ 核心流程</h4>
 <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-2">
 <div className="bg-surface p-3 rounded border border-edge/30 text-center">
 <div className="text-heading font-semibold text-sm">1. 启动</div>
 <div className="text-xs text-dim mt-1">启动浏览器实例</div>
 </div>
 <div className="bg-surface p-3 rounded border border-edge/30 text-center">
 <div className="text-heading font-semibold text-sm">2. 导航</div>
 <div className="text-xs text-dim mt-1">访问目标 URL</div>
 </div>
 <div className="bg-surface p-3 rounded border border-edge/30 text-center">
 <div className="text-heading font-semibold text-sm">3. 操作</div>
 <div className="text-xs text-dim mt-1">元素交互/截图</div>
 </div>
 <div className="bg-surface p-3 rounded border-l-2 border-l-edge-hover/30 text-center">
 <div className="text-heading font-semibold text-sm">4. 返回</div>
 <div className="text-xs text-dim mt-1">结果回传模型</div>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
 <div className="bg-surface p-3 rounded border border-edge">
 <div className="text-xl font-bold text-heading">Puppeteer</div>
 <div className="text-xs text-dim">浏览器驱动</div>
 </div>
 <div className="bg-surface p-3 rounded border border-edge">
 <div className="text-xl font-bold text-heading">Headless</div>
 <div className="text-xs text-dim">默认模式</div>
 </div>
 <div className="bg-surface p-3 rounded border border-edge">
 <div className="text-xl font-bold text-heading">Screenshot</div>
 <div className="text-xs text-dim">视觉反馈</div>
 </div>
 <div className="bg-surface p-3 rounded border border-edge">
 <div className="text-xl font-bold text-heading">CDP</div>
 <div className="text-xs text-dim">Chrome DevTools</div>
 </div>
 </div>

 <div className="text-xs text-dim bg-surface px-3 py-2 rounded flex items-center gap-2">
 <span>📁</span>
 <code>packages/core/src/tools/browser-agent/</code>
 </div>
 </div>
 )}
 </div>
 );
}

export function BrowserAgent() {
 const [isIntroExpanded, setIsIntroExpanded] = useState(true);

 const architectureDiagram = `flowchart TD
 User["用户请求<br/>（需要浏览器交互）"]
 AgentLoop["Agent Loop"]
 ToolRegistry["ToolRegistry"]
 BrowserTool["BrowserTool<br/>（工具入口）"]
 BC["BrowserController<br/>管理浏览器生命周期"]
 PN["PageNavigator<br/>页面导航与等待"]
 ES["ElementSelector<br/>元素定位与操作"]
 PR["ProgressReporter<br/>进度反馈"]
 Overlay["AutomationOverlay<br/>操作可视化"]
 Puppeteer["Puppeteer<br/>Chrome DevTools Protocol"]
 Browser["Chrome / Chromium"]

 User --> AgentLoop
 AgentLoop --> ToolRegistry
 ToolRegistry --> BrowserTool
 BrowserTool --> BC
 BC --> PN
 BC --> ES
 BC --> PR
 PN --> Puppeteer
 ES --> Puppeteer
 PR --> Overlay
 Overlay --> Puppeteer
 Puppeteer --> Browser

 style User fill:${getThemeColor("--mermaid-info-fill", "#dbeafe")},color:${getThemeColor("--color-text", "#1c1917")}
 style BrowserTool fill:${getThemeColor("--mermaid-purple-fill", "#ede9fe")},color:${getThemeColor("--color-text", "#1c1917")}
 style BC fill:${getThemeColor("--mermaid-warning-fill", "#fef3c7")},color:${getThemeColor("--color-text", "#1c1917")}
 style PN fill:${getThemeColor("--mermaid-success-fill", "#dcfce7")},color:${getThemeColor("--color-text", "#1c1917")}
 style ES fill:${getThemeColor("--mermaid-success-fill", "#dcfce7")},color:${getThemeColor("--color-text", "#1c1917")}
 style PR fill:${getThemeColor("--mermaid-muted-fill", "#f4f4f2")},color:${getThemeColor("--color-text", "#1c1917")}
 style Puppeteer fill:${getThemeColor("--mermaid-info-fill", "#dbeafe")},color:${getThemeColor("--color-text", "#1c1917")}
 style Browser fill:${getThemeColor("--mermaid-danger-fill", "#fee2e2")},color:${getThemeColor("--color-text", "#1c1917")}`;

 const workflowDiagram = `sequenceDiagram
 participant U as 用户
 participant AL as Agent Loop
 participant BT as BrowserTool
 participant BC as BrowserController
 participant PN as PageNavigator
 participant ES as ElementSelector
 participant B as Browser

 U->>AL: 请求（如"打开网页并截图"）
 AL->>BT: 调用 web_browser 工具
 BT->>BC: ensureBrowser()
 BC->>B: 启动 Headless Chrome
 B-->>BC: 浏览器实例就绪

 BT->>PN: navigate(url)
 PN->>B: page.goto(url)
 B-->>PN: 页面加载完成
 PN-->>BT: 导航结果

 BT->>ES: findElement(selector)
 ES->>B: page.$(selector)
 B-->>ES: 元素句柄
 ES->>B: element.click()
 B-->>ES: 操作完成

 BT->>BC: screenshot()
 BC->>B: page.screenshot()
 B-->>BC: 截图数据（Base64）
 BC-->>BT: 截图结果

 BT-->>AL: 工具执行结果
 AL-->>U: 返回分析与截图`;

 const browserControllerCode = `// packages/core/src/tools/browser-agent/browserController.ts

interface BrowserControllerOptions {
  headless?: boolean; // 默认 true（无头模式）
  defaultViewport?: Viewport; // 默认 1280x720
  timeout?: number; // 默认 30000ms
  executablePath?: string; // Chrome 可执行路径（可选）
}

class BrowserController {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private navigator: PageNavigator;
  private selector: ElementSelector;
  private progressReporter: ProgressReporter;

  // 确保浏览器实例存在（懒启动）
  async ensureBrowser(): Promise<Page> {
  if (!this.browser) {
  this.browser = await puppeteer.launch({
  headless: this.options.headless,
  defaultViewport: this.options.defaultViewport,
  args: [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-gpu',
  ],
  });
  this.page = await this.browser.newPage();
  await this.injectAutomationOverlay(this.page);
  }
  return this.page!;
  }

  // 关闭浏览器并清理资源
  async closeBrowser(): Promise<void> {
  if (this.browser) {
  await this.browser.close();
  this.browser = null;
  this.page = null;
  }
  }

  // 截图并返回 Base64 编码数据
  async screenshot(options?: ScreenshotOptions): Promise<string> {
  const page = await this.ensureBrowser();
  const buffer = await page.screenshot({
  type: 'png',
  fullPage: options?.fullPage ?? false,
  encoding: 'base64',
  });
  return buffer as string;
  }
}`;

 const pageNavigatorCode = `// packages/core/src/tools/browser-agent/pageNavigator.ts

class PageNavigator {
  // 导航到指定 URL
  async navigate(page: Page, url: string): Promise<NavigationResult> {
  try {
  const response = await page.goto(url, {
  waitUntil: 'networkidle2', // 等待网络空闲
  timeout: this.timeout,
  });

  return {
  success: true,
  url: page.url(),
  status: response?.status() ?? 0,
  title: await page.title(),
  };
  } catch (error) {
  return {
  success: false,
  url,
  error: \`Navigation failed: \${error.message}\`,
  };
  }
  }

  // 等待页面特定条件
  async waitForCondition(
  page: Page,
  condition: WaitCondition
  ): Promise<void> {
  switch (condition.type) {
  case 'selector':
  await page.waitForSelector(condition.value, {
  timeout: condition.timeout,
  });
  break;
  case 'navigation':
  await page.waitForNavigation({
  waitUntil: 'networkidle2',
  });
  break;
  case 'timeout':
  await new Promise(r => setTimeout(r, condition.value));
  break;
  }
  }
}`;

 const elementSelectorCode = `// packages/core/src/tools/browser-agent/elementSelector.ts

class ElementSelector {
  // 查找元素（支持 CSS 选择器和 XPath）
  async findElement(
  page: Page,
  selector: string,
  options?: FindOptions
  ): Promise<ElementHandle | null> {
  if (selector.startsWith('//') || selector.startsWith('(//')) {
  // XPath 选择器
  const [element] = await page.$x(selector);
  return element ?? null;
  }
  return page.$(selector);
  }

  // 点击元素
  async clickElement(
  page: Page,
  selector: string
  ): Promise<ActionResult> {
  const element = await this.findElement(page, selector);
  if (!element) {
  return { success: false, error: \`Element not found: \${selector}\` };
  }

  await element.click();
  return { success: true, action: 'click', selector };
  }

  // 向元素输入文本
  async typeIntoElement(
  page: Page,
  selector: string,
  text: string
  ): Promise<ActionResult> {
  const element = await this.findElement(page, selector);
  if (!element) {
  return { success: false, error: \`Element not found: \${selector}\` };
  }

  await element.type(text, { delay: 50 }); // 模拟打字延迟
  return { success: true, action: 'type', selector, text };
  }

  // 获取元素文本内容
  async getElementText(
  page: Page,
  selector: string
  ): Promise<string | null> {
  const element = await this.findElement(page, selector);
  if (!element) return null;
  return page.evaluate(el => el.textContent, element);
  }

  // 获取页面所有可交互元素的摘要
  async getInteractableElements(page: Page): Promise<ElementSummary[]> {
  return page.evaluate(() => {
  const elements: ElementSummary[] = [];
  const interactable = document.querySelectorAll(
  'a, button, input, select, textarea, [role="button"], [onclick]'
  );
  interactable.forEach((el, index) => {
  elements.push({
  index,
  tag: el.tagName.toLowerCase(),
  text: el.textContent?.trim().slice(0, 100) ?? '',
  selector: generateUniqueSelector(el),
  type: (el as HTMLInputElement).type ?? undefined,
  });
  });
  return elements;
  });
  }
}`;

 const toolInterfaceCode = `// packages/core/src/tools/browser-agent/browserTool.ts

// Browser Agent 注册为 web_browser 工具
class BrowserTool implements Tool {
  name = 'web_browser';
  description = 'Interact with web pages: navigate, click, type, screenshot, and extract content.';

  schema = {
  type: 'object',
  properties: {
  action: {
  type: 'string',
  enum: [
  'navigate', // 导航到 URL
  'click', // 点击元素
  'type', // 输入文本
  'screenshot', // 截取页面截图
  'get_text', // 获取元素/页面文本
  'get_elements', // 列出可交互元素
  'evaluate', // 执行 JavaScript
  'wait', // 等待条件
  'close', // 关闭浏览器
  ],
  description: 'The browser action to perform',
  },
  url: {
  type: 'string',
  description: 'URL to navigate to (for navigate action)',
  },
  selector: {
  type: 'string',
  description: 'CSS selector or XPath (for click/type/get_text)',
  },
  text: {
  type: 'string',
  description: 'Text to type (for type action)',
  },
  javascript: {
  type: 'string',
  description: 'JavaScript to evaluate (for evaluate action)',
  },
  fullPage: {
  type: 'boolean',
  description: 'Capture full page screenshot (default: false)',
  },
  },
  required: ['action'],
  };

  async execute(params: BrowserToolParams): Promise<ToolResult> {
  switch (params.action) {
  case 'navigate':
  return this.handleNavigate(params.url!);
  case 'click':
  return this.handleClick(params.selector!);
  case 'type':
  return this.handleType(params.selector!, params.text!);
  case 'screenshot':
  return this.handleScreenshot(params.fullPage);
  case 'get_text':
  return this.handleGetText(params.selector);
  case 'get_elements':
  return this.handleGetElements();
  case 'evaluate':
  return this.handleEvaluate(params.javascript!);
  case 'wait':
  return this.handleWait(params);
  case 'close':
  return this.handleClose();
  default:
  return { error: \`Unknown action: \${params.action}\` };
  }
  }
}`;

 const registrationCode = `// packages/core/src/config/config.ts（节选）

// Browser Agent 作为实验性工具注册
if (this.settings.experimental?.browserAgent) {
  const browserController = new BrowserController({
  headless: this.settings.experimental.browserAgentHeadless ?? true,
  timeout: this.settings.experimental.browserAgentTimeout ?? 30000,
  });

  this.getToolRegistry().registerTool(
  new BrowserTool(browserController, this.messageBus)
  );

  // 会话结束时自动清理浏览器资源
  this.onDispose(() => browserController.closeBrowser());
}`;

 const settingsCode = `// settings.json 配置项
{
  "experimental": {
  "browserAgent": true, // 启用 Browser Agent（默认 false）
  "browserAgentHeadless": true, // 使用无头模式（默认 true）
  "browserAgentTimeout": 30000 // 操作超时时间（ms，默认 30000）
  }
}`;

 const overlayCode = `// packages/core/src/tools/browser-agent/automationOverlay.ts

// 注入自动化覆盖层，用于可视化当前操作
async function injectAutomationOverlay(page: Page): Promise<void> {
  await page.evaluateOnNewDocument(() => {
  // 创建覆盖层容器
  const overlay = document.createElement('div');
  overlay.id = '__gemini_automation_overlay';
  overlay.style.cssText = \`
  position: fixed; top: 0; left: 0; right: 0;
  z-index: 999999; padding: 4px 12px;
  background: rgba(168, 85, 247, 0.9);
  color: white; font-size: 12px;
  font-family: monospace;
  display: flex; align-items: center; gap: 8px;
  \`;

  // 状态指示器
  const indicator = document.createElement('span');
  indicator.textContent = '● Gemini CLI Browser Agent';
  overlay.appendChild(indicator);

  // 操作描述
  const action = document.createElement('span');
  action.id = '__gemini_action';
  action.style.opacity = '0.8';
  overlay.appendChild(action);

  document.addEventListener('DOMContentLoaded', () => {
  document.body.prepend(overlay);
  });
  });
}

// 高亮当前操作的元素
async function highlightElement(
  page: Page,
  selector: string
): Promise<void> {
  await page.evaluate((sel) => {
  const el = document.querySelector(sel);
  if (!el) return;

  const rect = el.getBoundingClientRect();
  const highlight = document.createElement('div');
  highlight.style.cssText = \`
  position: fixed;
  top: \${rect.top}px; left: \${rect.left}px;
  width: \${rect.width}px; height: \${rect.height}px;
  border: 2px solid ${getThemeColor("--purple", "#7c3aed")};
  background: rgba(168, 85, 247, 0.1);
  z-index: 999998;
  pointer-events: none;
  transition: all 0.3s ease;
  \`;
  document.body.appendChild(highlight);

  // 2 秒后自动移除高亮
  setTimeout(() => highlight.remove(), 2000);
  }, selector);
}`;

 const progressReporterCode = `// packages/core/src/tools/browser-agent/progressReporter.ts

class ProgressReporter {
  private messageBus: MessageBus;

  constructor(messageBus: MessageBus) {
  this.messageBus = messageBus;
  }

  // 报告浏览器操作进度
  reportProgress(action: string, details: string): void {
  this.messageBus.publish('browser:progress', {
  type: 'browser_action',
  action,
  details,
  timestamp: Date.now(),
  });
  }

  // 报告导航事件
  reportNavigation(url: string, status: number): void {
  this.reportProgress('navigate', \`\${url} (HTTP \${status})\`);
  }

  // 报告元素操作
  reportElementAction(action: string, selector: string): void {
  this.reportProgress(action, \`Target: \${selector}\`);
  }

  // 报告截图完成
  reportScreenshot(fullPage: boolean): void {
  this.reportProgress(
  'screenshot',
  fullPage ? 'Full page capture' : 'Viewport capture'
  );
  }
}`;

 return (
 <div>
 <Introduction isExpanded={isIntroExpanded} onToggle={() => setIsIntroExpanded(!isIntroExpanded)} />

 <h2 className="text-2xl text-heading mb-5">Browser Agent（浏览器代理）</h2>

 {/* 概述 */}
 <section id="overview" className="mb-8">
 <Layer title="概述" icon="🌐">
 <p className="text-body mb-4">
 Browser Agent 是 Gemini CLI 的<strong>实验性功能</strong>，通过 Puppeteer 驱动 Chrome/Chromium 浏览器，
 赋予模型与 Web 页面直接交互的能力。它作为 <code className="text-heading">web_browser</code> 工具注册到
 ToolRegistry，遵循标准的工具调用协议。
 </p>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <HighlightBox title="页面导航" variant="blue">
 <p className="text-sm text-body">
 支持 URL 导航、等待页面加载、处理重定向、获取页面标题和状态码。
 </p>
 </HighlightBox>
 <HighlightBox title="元素操作" variant="green">
 <p className="text-sm text-body">
 点击、输入文本、获取内容、列出可交互元素，支持 CSS 选择器和 XPath。
 </p>
 </HighlightBox>
 <HighlightBox title="截图分析" variant="purple">
 <p className="text-sm text-body">
 截取页面或完整页面截图，以 Base64 返回给模型进行视觉分析。
 </p>
 </HighlightBox>
 </div>
 </Layer>
 </section>

 {/* 架构设计 */}
 <section id="architecture" className="mb-8">
 <Layer title="架构设计" icon="🏗️">
 <p className="text-body mb-4">
 Browser Agent 采用分层架构：<code className="text-heading">BrowserTool</code> 作为工具入口，
 <code className="text-heading"> BrowserController</code> 管理浏览器生命周期，
 <code className="text-heading"> PageNavigator</code> 和{' '}
 <code className="text-heading">ElementSelector</code> 分别处理导航和元素操作，
 <code className="text-heading"> ProgressReporter</code> 通过 MessageBus 报告操作进度。
 </p>

 <MermaidDiagram chart={architectureDiagram} title="Browser Agent 架构" />

 <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-base/50 rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-2">BrowserController</h4>
 <ul className="text-sm text-body space-y-1">
 <li>管理 Puppeteer Browser 实例的创建和销毁</li>
 <li>懒启动：首次需要时才创建浏览器</li>
 <li>会话结束时自动清理资源</li>
 <li>注入 AutomationOverlay 到每个页面</li>
 </ul>
 </div>
 <div className="bg-base/50 rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-2">PageNavigator / ElementSelector</h4>
 <ul className="text-sm text-body space-y-1">
 <li>PageNavigator：URL 导航、waitUntil 策略、超时处理</li>
 <li>ElementSelector：CSS/XPath 双模式定位</li>
 <li>元素交互：click / type / getText</li>
 <li>可交互元素发现：自动扫描页面交互点</li>
 </ul>
 </div>
 </div>
 </Layer>
 </section>

 {/* 工作流程 */}
 <section id="workflow" className="mb-8">
 <Layer title="工作流程" icon="🔄">
 <p className="text-body mb-4">
 当模型判断需要浏览器交互时，会通过 Agent Loop 调用{' '}
 <code className="text-heading">web_browser</code> 工具。BrowserController 采用懒启动模式，
 首次调用时启动浏览器实例，后续操作复用同一实例，直到显式关闭或会话结束。
 </p>

 <MermaidDiagram chart={workflowDiagram} title="Browser Agent 工作流程" />

 <div className="mt-4 bg-base/50 rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-2">关键流程说明</h4>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-body">
 <div>
 <div className="text-heading mb-1">懒启动策略</div>
 <p>
 浏览器不在 CLI 启动时创建，而是在第一次 <code>web_browser</code> 工具调用时才启动。
 这避免了不需要浏览器的场景中的资源浪费。
 </p>
 </div>
 <div>
 <div className="text-heading mb-1">实例复用</div>
 <p>
 同一会话中多次浏览器操作复用同一个 Browser 实例和 Page 对象，
 减少启动开销，同时保持页面状态（如 cookies、登录态）。
 </p>
 </div>
 </div>
 </div>
 </Layer>
 </section>

 {/* 核心功能 */}
 <section id="core-features" className="mb-8">
 <Layer title="核心功能详解" icon="⚡">
 <div className="space-y-6">
 <div>
 <h4 className="text-lg font-medium text-heading mb-3">1. BrowserController — 浏览器生命周期管理</h4>
 <CodeBlock
 title="browserController.ts"
 language="typescript"
 code={browserControllerCode}
 />
 </div>

 <div>
 <h4 className="text-lg font-medium text-heading mb-3">2. PageNavigator — 页面导航与等待</h4>
 <CodeBlock
 title="pageNavigator.ts"
 language="typescript"
 code={pageNavigatorCode}
 />
 </div>

 <div>
 <h4 className="text-lg font-medium text-heading mb-3">3. ElementSelector — 元素选择与操作</h4>
 <CodeBlock
 title="elementSelector.ts"
 language="typescript"
 code={elementSelectorCode}
 />
 </div>
 </div>
 </Layer>
 </section>

 {/* 进度报告与自动化覆盖层 */}
 <section id="progress-overlay" className="mb-8">
 <Layer title="进度报告与自动化覆盖层" icon="📊">
 <p className="text-body mb-4">
 Browser Agent 通过 <code className="text-heading">ProgressReporter</code> 向 MessageBus 发布操作进度，
 同时在浏览器页面中注入 <code className="text-heading">AutomationOverlay</code> 提供操作可视化，
 帮助开发者理解当前自动化步骤。
 </p>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <CodeBlock
 title="progressReporter.ts"
 language="typescript"
 code={progressReporterCode}
 />
 </div>
 <div>
 <CodeBlock
 title="automationOverlay.ts"
 language="typescript"
 code={overlayCode}
 />
 </div>
 </div>

 <div className="mt-4 bg-elevated border border-edge rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-2">AutomationOverlay 特性</h4>
 <ul className="text-sm text-body space-y-1">
 <li><strong>顶部状态栏</strong>：固定显示 "Gemini CLI Browser Agent" 标识和当前操作</li>
 <li><strong>元素高亮</strong>：操作目标元素时显示紫色边框和半透明背景</li>
 <li><strong>自动清理</strong>：高亮效果 2 秒后自动移除，不干扰后续操作</li>
 <li><strong>非侵入式</strong>：使用极高 z-index 确保可见，但不拦截页面交互</li>
 </ul>
 </div>
 </Layer>
 </section>

 {/* API 接口 */}
 <section id="api" className="mb-8">
 <Layer title="API 接口（web_browser 工具）" icon="🔧">
 <p className="text-body mb-4">
 Browser Agent 通过 <code className="text-heading">web_browser</code> 工具暴露所有功能。
 工具 Schema 使用 <code>action</code> 枚举区分不同操作，每种操作有对应的参数。
 </p>

 <CodeBlock
 title="browserTool.ts — 工具定义"
 language="typescript"
 code={toolInterfaceCode}
 />

 <div className="mt-4 overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border- border-edge text-left text-body">
 <th className="py-2 px-2">Action</th>
 <th className="py-2 px-2">必需参数</th>
 <th className="py-2 px-2">说明</th>
 <th className="py-2 px-2">返回值</th>
 </tr>
 </thead>
 <tbody className="text-body">
 <tr className="border- border-edge">
 <td className="py-2 px-2 text-heading">navigate</td>
 <td className="py-2 px-2 text-xs"><code>url</code></td>
 <td className="py-2 px-2 text-xs">导航到指定 URL</td>
 <td className="py-2 px-2 text-xs">URL、标题、HTTP 状态码</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2 px-2 text-heading">click</td>
 <td className="py-2 px-2 text-xs"><code>selector</code></td>
 <td className="py-2 px-2 text-xs">点击目标元素</td>
 <td className="py-2 px-2 text-xs">操作结果</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2 px-2 text-heading">type</td>
 <td className="py-2 px-2 text-xs"><code>selector</code>, <code>text</code></td>
 <td className="py-2 px-2 text-xs">向元素输入文本</td>
 <td className="py-2 px-2 text-xs">操作结果</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2 px-2 text-heading">screenshot</td>
 <td className="py-2 px-2 text-xs">（无）</td>
 <td className="py-2 px-2 text-xs">截取页面截图</td>
 <td className="py-2 px-2 text-xs">Base64 PNG 数据</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2 px-2 text-heading">get_text</td>
 <td className="py-2 px-2 text-xs"><code>selector</code>（可选）</td>
 <td className="py-2 px-2 text-xs">获取元素或整页文本</td>
 <td className="py-2 px-2 text-xs">文本内容</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2 px-2 text-heading">get_elements</td>
 <td className="py-2 px-2 text-xs">（无）</td>
 <td className="py-2 px-2 text-xs">列出可交互元素</td>
 <td className="py-2 px-2 text-xs">元素摘要数组</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2 px-2 text-heading">evaluate</td>
 <td className="py-2 px-2 text-xs"><code>javascript</code></td>
 <td className="py-2 px-2 text-xs">在页面中执行 JS</td>
 <td className="py-2 px-2 text-xs">执行结果</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2 px-2 text-heading">wait</td>
 <td className="py-2 px-2 text-xs"><code>selector</code> 或 timeout</td>
 <td className="py-2 px-2 text-xs">等待条件满足</td>
 <td className="py-2 px-2 text-xs">等待结果</td>
 </tr>
 <tr>
 <td className="py-2 px-2 text-heading">close</td>
 <td className="py-2 px-2 text-xs">（无）</td>
 <td className="py-2 px-2 text-xs">关闭浏览器实例</td>
 <td className="py-2 px-2 text-xs">关闭确认</td>
 </tr>
 </tbody>
 </table>
 </div>
 </Layer>
 </section>

 {/* 与工具系统的集成 */}
 <section id="tool-integration" className="mb-8">
 <Layer title="与工具系统的集成" icon="🧩">
 <p className="text-body mb-4">
 Browser Agent 作为标准工具注册到 <code className="text-heading">ToolRegistry</code>，
 遵循与其他内置工具相同的生命周期管理。通过{' '}
 <code className="text-heading">experimental.browserAgent</code> 配置项控制是否启用。
 </p>

 <CodeBlock
 title="工具注册（config.ts）"
 language="typescript"
 code={registrationCode}
 />

 <div className="mt-4">
 <CodeBlock
 title="settings.json 配置"
 language="json"
 code={settingsCode}
 />
 </div>

 <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="bg-base/50 rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-2">工具注册</h4>
 <p className="text-sm text-body">
 通过 <code>registerTool()</code> 注册到 ToolRegistry，
 模型可通过标准 function calling 机制调用。
 </p>
 </div>
 <div className="bg-base/50 rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-2">生命周期绑定</h4>
 <p className="text-sm text-body">
 通过 <code>onDispose()</code> 回调确保会话结束时浏览器实例被正确清理。
 </p>
 </div>
 <div className="bg-base/50 rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-2">MessageBus 集成</h4>
 <p className="text-sm text-body">
 操作进度通过 MessageBus 发布，UI 层可订阅 <code>browser:progress</code> 事件展示状态。
 </p>
 </div>
 </div>
 </Layer>
 </section>

 {/* 限制和注意事项 */}
 <section id="limitations" className="mb-8">
 <Layer title="限制和注意事项" icon="⚠️">
 <HighlightBox title="实验性功能警告" variant="red">
 <p className="text-sm text-body mb-2">
 Browser Agent 是实验性功能，API 和行为可能在未来版本中发生变化。生产环境使用需谨慎评估。
 </p>
 <ul className="text-sm text-body space-y-1">
 <li>需要系统安装 Chrome/Chromium，或通过 Puppeteer 自动下载</li>
 <li>默认使用 Headless 模式，部分依赖 GPU 渲染的页面可能表现不同</li>
 <li>不支持多标签页操作，当前版本仅操作单一 Page 实例</li>
 </ul>
 </HighlightBox>

 <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
 <HighlightBox title="安全边界" variant="yellow">
 <ul className="text-sm text-body space-y-1">
 <li><strong>evaluate 操作</strong>：在页面上下文中执行任意 JS，需要用户确认</li>
 <li><strong>导航限制</strong>：默认不限制可访问的 URL，但受 Policy Engine 约束</li>
 <li><strong>敏感数据</strong>：截图可能包含敏感信息，会被传送到模型</li>
 <li><strong>Cookie/Session</strong>：浏览器实例共享会话状态，注意登录态泄露风险</li>
 </ul>
 </HighlightBox>

 <HighlightBox title="性能考虑" variant="blue">
 <ul className="text-sm text-body space-y-1">
 <li><strong>启动开销</strong>：首次启动浏览器需要 1-3 秒</li>
 <li><strong>内存占用</strong>：Chrome 实例通常占用 100-300MB 内存</li>
 <li><strong>截图大小</strong>：全页截图可能产生较大的 Base64 数据</li>
 <li><strong>超时设置</strong>：复杂页面可能需要调高默认 30s 超时</li>
 </ul>
 </HighlightBox>
 </div>

 <div className="mt-4 bg-base/50 rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-2">已知限制</h4>
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border- border-edge text-left text-body">
 <th className="py-2 px-2">限制</th>
 <th className="py-2 px-2">描述</th>
 <th className="py-2 px-2">建议处理方式</th>
 </tr>
 </thead>
 <tbody className="text-body">
 <tr className="border- border-edge">
 <td className="py-2 px-2 text-heading">单页面</td>
 <td className="py-2 px-2 text-xs">不支持同时操作多个标签页</td>
 <td className="py-2 px-2 text-xs">使用 navigate 在页面间切换</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2 px-2 text-heading">无文件下载</td>
 <td className="py-2 px-2 text-xs">不支持文件下载操作</td>
 <td className="py-2 px-2 text-xs">使用 shell 命令下载文件</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2 px-2 text-heading">无音视频</td>
 <td className="py-2 px-2 text-xs">Headless 模式下无法播放音视频</td>
 <td className="py-2 px-2 text-xs">使用 get_text 获取页面内容</td>
 </tr>
 <tr>
 <td className="py-2 px-2 text-heading">验证码</td>
 <td className="py-2 px-2 text-xs">无法处理 CAPTCHA 验证</td>
 <td className="py-2 px-2 text-xs">切换到 headed 模式手动处理</td>
 </tr>
 </tbody>
 </table>
 </div>
 </div>
 </Layer>
 </section>

 {/* 使用示例 */}
 <section id="examples" className="mb-8">
 <Layer title="使用示例" icon="💡">
 <p className="text-body mb-4">
 以下是 Browser Agent 在实际场景中的典型用法。模型会根据用户请求自动选择合适的 action 序列。
 </p>

 <div className="space-y-4">
 <CodeBlock
 title="示例 1：访问页面并提取内容"
 language="typescript"
 code={`// 模型自动生成的工具调用序列：

// Step 1: 导航到目标页面
{ action: 'navigate', url: 'https://docs.example.com/api' }
// → { success: true, title: 'API Documentation', status: 200 }

// Step 2: 获取页面文本
{ action: 'get_text', selector: 'main .content' }
// → { text: 'API Reference\\n\\nGET /users - List all users...' }

// Step 3: 截图留档
{ action: 'screenshot', fullPage: true }
// → { screenshot: 'data:image/png;base64,iVBOR...' }`}
 />

 <CodeBlock
 title="示例 2：表单交互"
 language="typescript"
 code={`// Step 1: 导航到登录页面
{ action: 'navigate', url: 'http://localhost:3000/login' }

// Step 2: 列出可交互元素
{ action: 'get_elements' }
// → [
// { index: 0, tag: 'input', selector: '#email', type: 'email' },
// { index: 1, tag: 'input', selector: '#password', type: 'password' },
// { index: 2, tag: 'button', selector: '.btn-login', text: 'Sign In' },
// ]

// Step 3: 填写表单
{ action: 'type', selector: '#email', text: 'test@example.com' }
{ action: 'type', selector: '#password', text: 'testpass123' }

// Step 4: 提交
{ action: 'click', selector: '.btn-login' }

// Step 5: 验证结果
{ action: 'screenshot' }
// → 截图显示登录成功后的仪表板页面`}
 />
 </div>
 </Layer>
 </section>

 {/* 设计决策 */}
 <section id="design-decisions" className="mb-8 bg-surface rounded-lg border border-edge p-6">
 <h3 className="text-xl font-semibold text-heading mb-4">设计决策</h3>

 <div className="space-y-4">
 <div className="bg-base/30 rounded-lg p-4">
 <h4 className="text-lg font-medium text-heading mb-2">为什么使用单一 action 枚举而非独立工具？</h4>
 <p className="text-sm text-body">
 <strong className="text-heading">决策</strong>：所有浏览器操作通过一个{' '}
 <code>web_browser</code> 工具的 <code>action</code> 参数区分，而不是注册多个独立工具。
 </p>
 <ul className="text-sm text-body list-disc list-inside mt-2 space-y-1">
 <li>减少工具列表膨胀，模型更容易理解"浏览器操作"这一概念</li>
 <li>共享 BrowserController 状态更自然（单一工具 = 单一控制器实例）</li>
 <li>便于实验阶段整体开关（一个配置项启用/禁用所有浏览器功能）</li>
 </ul>
 </div>

 <div className="bg-base/30 rounded-lg p-4">
 <h4 className="text-lg font-medium text-heading mb-2">为什么选择 Puppeteer 而非 Playwright？</h4>
 <p className="text-sm text-body">
 <strong className="text-heading">决策</strong>：使用 Puppeteer 作为浏览器自动化驱动。
 </p>
 <ul className="text-sm text-body list-disc list-inside mt-2 space-y-1">
 <li>Puppeteer 是 Google 官方项目，与 Gemini CLI 的 Google 生态契合</li>
 <li>更轻量，仅支持 Chrome/Chromium，减少依赖体积</li>
 <li>CDP (Chrome DevTools Protocol) 直连，性能和调试体验更好</li>
 </ul>
 </div>

 <div className="bg-base/30 rounded-lg p-4">
 <h4 className="text-lg font-medium text-heading mb-2">为什么默认 Headless？</h4>
 <p className="text-sm text-body">
 <strong className="text-heading">决策</strong>：默认以无头模式运行浏览器。
 </p>
 <ul className="text-sm text-body list-disc list-inside mt-2 space-y-1">
 <li>CLI 工具天然适合无 GUI 环境（CI/CD、远程服务器、容器）</li>
 <li>模型通过截图获取视觉信息，不需要实时显示浏览器窗口</li>
 <li>用户可通过 <code>browserAgentHeadless: false</code> 切换为有头模式进行调试</li>
 </ul>
 </div>
 </div>
 </section>

 <RelatedPages pages={relatedPages} />
 </div>
 );
}
