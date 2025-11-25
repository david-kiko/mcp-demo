# 数据分析路由器

**🎯 职责：根据用户需求选择合适的数据分析工作流**

---

## 🔄 工作流路由

### 📊 CSV分析
**触发条件**：CSV文件名、分析、统计、处理
```bash
立即执行：Read(scenarios/data-analysis/workflows/csv-analysis.md)
```

### 🤖 机器学习
**触发条件**：ML、模型、训练、预测、算法
```bash
立即执行：Read(scenarios/data-analysis/workflows/machine-learning.md)
```

### ⚡ 批量处理
**触发条件**：批量、大量、ETL、数据流程
```bash
立即执行：Read(scenarios/data-analysis/workflows/batch-processing.md)
```

### 📈 报告生成
**触发条件**：报告、可视化、图表、展示
```bash
立即执行：Read(scenarios/data-analysis/templates/report-prompt.md)
```
**注意**：报告生成已集成到各工作流中，无需单独执行

---

## 🔧 约束条件
- **镜像**：`registry.opsman.top/kmai/python:3.12-alpine-data`
- **环境**：Kubernetes集群 + RustFS存储
- **工具**：仅使用MCP工具

---

*纯路由器，具体实现请参考工作流文档*