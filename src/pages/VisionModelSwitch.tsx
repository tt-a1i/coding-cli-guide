import { HighlightBox } from '../components/HighlightBox';
import { FlowDiagram } from '../components/FlowDiagram';
import { CodeBlock } from '../components/CodeBlock';

export function VisionModelSwitch() {
  const visionSwitchFlow = {
    title: 'VLM 自动切换流程',
    nodes: [
      { id: 'start', label: '用户发送消息', type: 'start' as const },
      { id: 'check_image', label: '检测是否\n包含图片', type: 'process' as const },
      { id: 'has_image', label: '有图片?', type: 'decision' as const },
      { id: 'check_auth', label: '检查认证类型', type: 'process' as const },
      { id: 'is_qwen', label: 'Qwen OAuth?', type: 'decision' as const },
      { id: 'check_model', label: '当前是否\n已是 VLM?', type: 'decision' as const },
      { id: 'check_format', label: '检查图片\n格式支持', type: 'process' as const },
      { id: 'format_ok', label: '格式支持?', type: 'decision' as const },
      { id: 'check_yolo', label: 'YOLO 模式?', type: 'decision' as const },
      { id: 'auto_switch', label: '自动切换\n到 VLM', type: 'process' as const },
      { id: 'show_dialog', label: '显示切换\n对话框', type: 'process' as const },
      { id: 'show_warning', label: '显示格式\n不支持警告', type: 'process' as const },
      { id: 'proceed', label: '继续处理', type: 'end' as const },
    ],
    edges: [
      { from: 'start', to: 'check_image' },
      { from: 'check_image', to: 'has_image' },
      { from: 'has_image', to: 'proceed', label: 'No' },
      { from: 'has_image', to: 'check_auth', label: 'Yes' },
      { from: 'check_auth', to: 'is_qwen' },
      { from: 'is_qwen', to: 'proceed', label: 'No' },
      { from: 'is_qwen', to: 'check_model', label: 'Yes' },
      { from: 'check_model', to: 'proceed', label: 'Yes (已是VLM)' },
      { from: 'check_model', to: 'check_format', label: 'No' },
      { from: 'check_format', to: 'format_ok' },
      { from: 'format_ok', to: 'show_warning', label: 'No' },
      { from: 'format_ok', to: 'check_yolo', label: 'Yes' },
      { from: 'show_warning', to: 'check_yolo' },
      { from: 'check_yolo', to: 'auto_switch', label: 'Yes' },
      { from: 'check_yolo', to: 'show_dialog', label: 'No' },
      { from: 'auto_switch', to: 'proceed' },
      { from: 'show_dialog', to: 'proceed' },
    ],
  };

  const imageDetectionCode = `// 检测消息是否包含图片
// packages/cli/src/ui/hooks/useVisionAutoSwitch.ts

function hasImageParts(parts: PartListUnion): boolean {
  if (typeof parts === 'string') {
    return false;
  }

  if (Array.isArray(parts)) {
    return parts.some((part) => {
      if (typeof part === 'string') return false;
      return isImagePart(part);
    });
  }

  if (typeof parts === 'object') {
    return isImagePart(parts);
  }

  return false;
}

function isImagePart(part: Part): boolean {
  // 检查 inlineData (base64 图片)
  if ('inlineData' in part &&
      part.inlineData?.mimeType?.startsWith('image/')) {
    return true;
  }

  // 检查 fileData (文件引用)
  if ('fileData' in part &&
      part.fileData?.mimeType?.startsWith('image/')) {
    return true;
  }

  return false;
}`;

  const shouldOfferSwitchCode = `// 判断是否需要提供 VLM 切换
export function shouldOfferVisionSwitch(
  parts: PartListUnion,
  authType: AuthType,
  currentModel: string,
  visionModelPreviewEnabled: boolean = true,
): boolean {
  // 1. 只对 Qwen OAuth 认证生效
  if (authType !== AuthType.QWEN_OAUTH) {
    return false;
  }

  // 2. 如果预览功能被禁用，不提供切换
  if (!visionModelPreviewEnabled) {
    return false;
  }

  // 3. 如果当前已经是 Vision 模型，不需要切换
  if (isVisionModel(currentModel)) {
    return false;
  }

  // 4. 检查消息是否包含图片
  return hasImageParts(parts);
}`;

  const switchOutcomeCode = `// VLM 切换选项
export enum VisionSwitchOutcome {
  SwitchOnce = 'switch_once',           // 仅本次切换
  SwitchSessionToVL = 'switch_session', // 本会话切换
  ContinueWithCurrentModel = 'continue' // 保持当前模型
}

// 处理切换结果
export function processVisionSwitchOutcome(
  outcome: VisionSwitchOutcome,
): VisionSwitchResult {
  const vlModelId = getDefaultVisionModel(); // qwen3-vl-plus

  switch (outcome) {
    case VisionSwitchOutcome.SwitchOnce:
      // 仅本次请求使用 VLM，之后恢复
      return { modelOverride: vlModelId };

    case VisionSwitchOutcome.SwitchSessionToVL:
      // 本会话持续使用 VLM
      return { persistSessionModel: vlModelId };

    case VisionSwitchOutcome.ContinueWithCurrentModel:
      // 继续使用当前模型 (可能导致图片被忽略)
      return {};

    default:
      return {};
  }
}`;

  const yoloModeCode = `// YOLO 模式下自动切换
if (config.getApprovalMode() === ApprovalMode.YOLO) {
  const vlModelId = getDefaultVisionModel();
  originalModelRef.current = config.getModel();

  await config.setModel(vlModelId, {
    reason: 'vision_auto_switch',
    context: 'YOLO mode auto-switch for image content',
  });

  return {
    shouldProceed: true,
    originalModel: originalModelRef.current,
  };
}`;

  const defaultVlmModeCode = `// 配置默认 VLM 切换行为
// 来源: packages/cli/src/config/settings.ts:136

// settings.json - v2 配置格式
{
  "experimental": {
    "vlmSwitchMode": "once"  // "once" | "session" | "persist"
  }
}

// vlmSwitchMode 选项说明：
// "once"    - 每次包含图片时都只切换一次
// "session" - 切换后整个会话保持 VLM
// "persist" - 不自动切换，保持当前模型`;

  const formatCheckCode = `// 检查图片格式支持
function checkImageFormatsSupport(parts: PartListUnion): {
  hasImages: boolean;
  hasUnsupportedFormats: boolean;
  unsupportedMimeTypes: string[];
} {
  const unsupportedMimeTypes: string[] = [];
  let hasImages = false;

  // 遍历所有 parts 检查图片格式
  for (const part of partsArray) {
    let mimeType: string | undefined;

    if ('inlineData' in part &&
        part.inlineData?.mimeType?.startsWith('image/')) {
      hasImages = true;
      mimeType = part.inlineData.mimeType;
    }

    if ('fileData' in part &&
        part.fileData?.mimeType?.startsWith('image/')) {
      hasImages = true;
      mimeType = part.fileData.mimeType;
    }

    // 检查 mime type 是否支持
    if (mimeType && !isSupportedImageMimeType(mimeType)) {
      unsupportedMimeTypes.push(mimeType);
    }
  }

  return {
    hasImages,
    hasUnsupportedFormats: unsupportedMimeTypes.length > 0,
    unsupportedMimeTypes,
  };
}

// 支持的图片格式
// - image/png
// - image/jpeg
// - image/gif
// - image/webp`;

  return (
    <div className="space-y-8">
      {/* 概述 */}
      <section>
        <h2 className="text-2xl font-bold text-cyan-400 mb-4">Vision 模型自动切换</h2>
        <p className="text-gray-300 mb-4">
          当用户发送包含图片的消息时，CLI 会自动检测并提供切换到 Vision 模型 (VLM) 的选项。
          这确保图片能被正确分析，同时让用户控制切换行为。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <HighlightBox title="自动检测" variant="blue">
            <p className="text-sm text-gray-300">
              检测消息中的图片内容，包括 Ctrl+V 粘贴、@ 引用的图片文件。
            </p>
          </HighlightBox>

          <HighlightBox title="智能切换" variant="green">
            <p className="text-sm text-gray-300">
              根据配置和审批模式，自动或提示用户切换到 Vision 模型。
            </p>
          </HighlightBox>

          <HighlightBox title="格式验证" variant="purple">
            <p className="text-sm text-gray-300">
              检查图片格式是否支持，不支持时显示警告信息。
            </p>
          </HighlightBox>
        </div>
      </section>

      {/* 限制条件 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">生效条件</h3>
        <HighlightBox title="仅 Qwen OAuth 认证" variant="red">
          <p className="text-sm text-gray-300">
            VLM 自动切换功能<strong>仅在 Qwen OAuth 认证</strong>下生效。
            使用 OpenAI API 密钥时，此功能不会触发。
          </p>
        </HighlightBox>

        <div className="mt-4 bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-cyan-400 mb-3">切换条件检查</h4>
          <ul className="text-sm text-gray-300 space-y-2">
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>认证类型为 Qwen OAuth</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>visionModelPreviewEnabled 为 true</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>当前模型不是 Vision 模型</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>消息包含图片内容</span>
            </li>
          </ul>
        </div>
      </section>

      {/* 切换流程 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">自动切换流程</h3>
        <FlowDiagram {...visionSwitchFlow} />
      </section>

      {/* 切换对话框 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">切换对话框</h3>
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
          <div className="text-center mb-4">
            <span className="text-2xl">🖼️</span>
            <h4 className="text-lg font-semibold text-white mt-2">Image detected</h4>
            <p className="text-gray-400 text-sm mt-1">
              Your message contains an image. Would you like to use a vision model?
            </p>
          </div>

          <div className="space-y-3 max-w-md mx-auto">
            <div className="flex items-center gap-3 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
              <div className="w-4 h-4 rounded-full border-2 border-green-500 bg-green-500"></div>
              <div>
                <p className="text-green-400 font-medium">Switch for this message only</p>
                <p className="text-gray-400 text-xs">Use vision model once, then switch back</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <div className="w-4 h-4 rounded-full border-2 border-blue-500"></div>
              <div>
                <p className="text-blue-400 font-medium">Switch for this session</p>
                <p className="text-gray-400 text-xs">Use vision model for the rest of the session</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-800/50 border border-gray-600 rounded-lg">
              <div className="w-4 h-4 rounded-full border-2 border-gray-500"></div>
              <div>
                <p className="text-gray-300 font-medium">Continue with current model</p>
                <p className="text-gray-400 text-xs">Image may not be analyzed properly</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <HighlightBox title="Switch once" variant="green">
            <p className="text-gray-300">仅本次请求使用 VLM，之后自动恢复原模型。</p>
          </HighlightBox>
          <HighlightBox title="Switch session" variant="blue">
            <p className="text-gray-300">本会话持续使用 VLM，直到手动切换或结束。</p>
          </HighlightBox>
          <HighlightBox title="Continue" variant="default">
            <p className="text-gray-300">保持当前模型，图片可能无法被正确分析。</p>
          </HighlightBox>
        </div>
      </section>

      {/* 代码实现 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">核心实现</h3>
        <CodeBlock code={imageDetectionCode} language="typescript" title="图片检测" />
        <CodeBlock code={shouldOfferSwitchCode} language="typescript" title="判断是否需要切换" />
      </section>

      {/* 切换选项 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">切换选项处理</h3>
        <CodeBlock code={switchOutcomeCode} language="typescript" title="切换结果处理" />
      </section>

      {/* YOLO 模式 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">YOLO 模式行为</h3>
        <HighlightBox title="YOLO 模式自动切换" variant="red">
          <p className="text-sm text-gray-300">
            在 YOLO 审批模式下，检测到图片时会<strong>自动切换</strong>到 Vision 模型，
            无需用户确认。请求完成后自动恢复原模型。
          </p>
        </HighlightBox>

        <CodeBlock code={yoloModeCode} language="typescript" title="YOLO 模式自动切换" />
      </section>

      {/* 配置 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">配置默认行为</h3>
        <CodeBlock code={defaultVlmModeCode} language="json" title="默认 VLM 切换模式" />

        <div className="mt-4 bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-cyan-400 mb-3">vlmSwitchMode 选项</h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="text-left p-2">值</th>
                <th className="text-left p-2">行为</th>
                <th className="text-left p-2">说明</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-700/50">
                <td className="p-2"><code className="text-green-400">once</code></td>
                <td className="p-2">单次切换</td>
                <td className="p-2">每次图片请求后恢复原模型</td>
              </tr>
              <tr className="border-b border-gray-700/50">
                <td className="p-2"><code className="text-blue-400">session</code></td>
                <td className="p-2">会话切换</td>
                <td className="p-2">切换后保持到会话结束</td>
              </tr>
              <tr>
                <td className="p-2"><code className="text-gray-400">persist</code></td>
                <td className="p-2">不切换</td>
                <td className="p-2">保持当前模型，不自动切换</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 格式支持 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">图片格式支持</h3>
        <CodeBlock code={formatCheckCode} language="typescript" title="格式验证" />

        <div className="mt-4 grid grid-cols-2 gap-4">
          <HighlightBox title="支持的格式" variant="green">
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• image/png</li>
              <li>• image/jpeg</li>
              <li>• image/gif</li>
              <li>• image/webp</li>
            </ul>
          </HighlightBox>

          <HighlightBox title="不支持的格式" variant="red">
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• image/bmp</li>
              <li>• image/tiff</li>
              <li>• image/svg+xml</li>
              <li>• 其他格式...</li>
            </ul>
          </HighlightBox>
        </div>

        <HighlightBox title="格式不支持警告" variant="yellow">
          <p className="text-sm text-gray-300">
            当图片格式不支持时，会显示警告信息但仍继续处理。
            建议将图片转换为支持的格式以获得最佳效果。
          </p>
        </HighlightBox>
      </section>

      {/* 模型信息 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">可用模型</h3>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="text-left p-2">模型</th>
                <th className="text-left p-2">ID</th>
                <th className="text-left p-2">支持图片</th>
                <th className="text-left p-2">说明</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-700/50">
                <td className="p-2 font-semibold">Qwen Coder</td>
                <td className="p-2"><code>qwen3-coder-plus</code></td>
                <td className="p-2 text-red-400">✗</td>
                <td className="p-2">代码模型，不支持图片</td>
              </tr>
              <tr>
                <td className="p-2 font-semibold">Qwen Vision</td>
                <td className="p-2"><code>qwen3-vl-plus</code></td>
                <td className="p-2 text-green-400">✓</td>
                <td className="p-2">Vision 模型，支持图片分析</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 最佳实践 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">最佳实践</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
            <h4 className="text-green-400 font-semibold mb-2">推荐做法</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>✓ 使用支持的图片格式</li>
              <li>✓ 需要多次图片分析时选择 "session"</li>
              <li>✓ 单次截图选择 "once"</li>
              <li>✓ 使用 Ctrl+V 快速粘贴图片</li>
            </ul>
          </div>
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <h4 className="text-red-400 font-semibold mb-2">注意事项</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>✗ VLM 可能不如 Coder 擅长代码</li>
              <li>✗ 大图片会增加 token 消耗</li>
              <li>✗ 不支持的格式需先转换</li>
              <li>✗ 仅 Qwen OAuth 支持此功能</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
