---
title: CellForge
order: 4
category: AI for biology & model evaluation
headline: Automated models still need scientific judgment.
summary: When repeated model-generation runs produced different architectures and predictive performance, I built an evaluation framework to test generalization to entirely unseen perturbations.
hook: Reliability has to hold beyond the model and setting that worked best.
status: Benchmarking research
context: Gerstein Lab · Yale
tags: [Held-out perturbations, Generalization, Reproducible benchmarks]
diagram: evaluation
image: null
image_alt: null
image_caption: null
outputs:
  - label: Benchmark / code
    detail: Repository link to add
    url: null
  - label: Manuscript
    detail: Publication details to add
    url: null
sources: [CV, SOP, Website specification]
---
## 01. The Question

How reliably do automatically generated models generalize to unseen perturbations and cellular contexts? In CellForge, different runs could produce different architectures with substantially different predictive performance.

## 02. Why It Matters

An automated design process still needs an evaluation that supports its biological claims. Holding out individual observations is different from asking whether a model can predict the response to a perturbation it has never seen.

## 03. The Approach

My evaluation framework holds out entire perturbations during training. It measures mean squared error, Pearson correlation, and explained variance across all measured features and among the features most responsive to perturbation.

The protocol was applied to six datasets. The benchmarking work included Adamson, Norman, Srivatsan, and Schiebinger datasets, with comparisons across generated architectures and established baselines.

## 04. My Contribution

I built the reproducible benchmarking framework, developed task-specific models integrating cell state and perturbation context, and evaluated generalization to unseen perturbations and cellular contexts.

## 05. What We Found

CellForge-generated models matched or surpassed established baselines in some genetic-perturbation settings. Performance varied across generated architectures and was more mixed for drug perturbations. These results made the limits of a single aggregate performance claim particularly clear.

## 06. What It Led Me To Ask

How can an evaluation reveal which biological responses a model preserves and where it fails? Autonomous model design makes methodological judgment about assumptions, benchmarks, and generalization more consequential.

## 07. Outputs

**Links to add.** Benchmark code, manuscript details, and supporting materials have not yet been linked.
