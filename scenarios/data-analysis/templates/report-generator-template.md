# 报告生成调用模板

## 使用场景
当数据分析完成后，如果用户需要可视化报告或复杂分析结果展示，使用此模板调用报告生成功能。

## 调用步骤

### 1. 准备分析结果数据
从Kubernetes作业的result.json中提取关键数据：
- summary统计数据
- 分类统计数据
- 趋势数据
- 其他分析结果

### 2. 读取报告提示词
```bash
# 读取报告生成提示词模板
Read - file_path="report-prompt.md"
```

### 3. 构建报告内容
结合以下要素：
- 分析结果数据
- 用户具体需求
- 业务场景背景

### 4. 生成HTML报告
将报告保存到生成文件目录（按年月分组）：
```bash
Write - file_path=".generated/reports/{YYYY-MM}/{task-name}-{timestamp}-report.html" - content="{HTML内容}"
```

## 报告命名规范
- 格式：`{task-name}-{YYYYMMDD-HHMMSS}-report.html`
- 示例：`demo-analysis-20251119-020000-report.html`

## 报告展示
生成完成后，按以下格式输出：
```bash
echo "✅ 报告生成完成！"
echo "📊 报告标题：{报告标题}"
echo "📁 完整路径：$(pwd)/.generated/reports/{YYYY-MM}/{task-name}-{timestamp}-report.html"
echo "💡 使用方法：复制上述路径到浏览器地址栏中直接打开"
echo ""
echo "📋 报告内容：{简要说明报告主要内容}"
echo "🎯 特色功能：{交互式图表、数据筛选、统计分析等}"
```

## 注意事项
1. **按需生成**：只有在用户明确要求时才生成
2. **数据准确性**：确保所有数据和图表与原始分析结果一致
3. **文件管理**：统一保存在.generated/reports/目录中，按年月分组
4. **内容完整性**：包含所有关键分析结果和业务洞察