# 通用报告输出模板

**用途**：确保所有报告生成后都提供完整、易用的文件路径信息

## 标准输出格式

### 数据分析报告
```bash
echo "✅ 数据分析完成！"
echo "📊 分析文件：{filename}"
echo "📁 完整路径：$(pwd)/.generated/reports/{YYYY-MM}/{task-name}-{timestamp}-report.html"
echo "💡 使用方法：复制上述路径到浏览器地址栏中直接打开"
echo ""
echo "📋 分析摘要："
echo "   - 数据行数：{row_count}"
echo "   - 数据列数：{column_count}"
echo "   - 关键发现：{main_findings}"
echo ""
echo "🎯 报告特色：交互式图表、数据筛选、统计分析"
```

### 开发环境配置报告
```bash
echo "✅ 开发环境配置完成！"
echo "🔧 环境名称：{env_name}"
echo "📁 配置文件：$(pwd)/.generated/dev-env/{YYYY-MM}/{env-config}.yaml"
echo "💡 使用方法：配置文件已自动应用到Kubernetes集群"
echo ""
echo "📋 连接信息："
echo "   - SSH端口：{ssh_port}"
echo "   - Web端口：{web_port}"
echo "   - 访问地址：{access_url}"
```

## 输出规范

### 🚨 必须包含的信息
1. **完整文件路径**：使用`$(pwd)`获取绝对路径
2. **使用方法说明**：明确告知如何使用
3. **关键信息摘要**：重要的统计数据或配置信息
4. **操作指引**：下一步如何查看或使用结果

### 📁 路径格式标准
- **绝对路径**：`/full/path/to/project/.generated/{type}/{YYYY-MM}/{filename}`
- **变量替换**：使用`$(pwd)`确保路径准确性
- **避免相对路径**：不要使用`./`或`../`

### 💡 用户体验优化
- **一键复制**：路径应该可以直接复制使用
- **清晰说明**：明确告知如何打开或使用文件
- **关键信息**：突出显示最重要的数据或配置

## 示例输出

### 正确示例
```bash
echo "📁 完整路径：$(pwd)/.generated/reports/2025-11/demo-analysis-20251124-163000-report.html"
```

### 错误示例
```bash
echo "📁 文件名：demo-analysis-20251124-163000-report.html"
echo "📁 相对路径：.generated/reports/2025-11/demo-analysis.html"
```

## 实施检查清单

- [ ] 使用`$(pwd)`获取绝对路径
- [ ] 包含完整的目录结构（.generated/{type}/{YYYY-MM}/）
- [ ] 提供使用方法说明
- [ ] 突出显示关键信息
- [ ] 避免使用相对路径
- [ ] 确保路径可以直接复制使用