# "Choose Your Own Adventure" Evaluation
This repo has resources for "Choose Your Own Adventure"-style evaluation, as described in the [2021 NAACL paper](https://www.aclweb.org/anthology/2021.naacl-main.279/).

## Evaluation script
The evaluation script (`eval_script.py`) takes in a results file and runs the analyses described in the CYOA paper, based on the writers' preferences, the writers' revisions, and the human- vs. machine-generated text.

It compares two models, labeled Model and Baseline.

The script includes analyses from previous work, gathered in `story-eval-utils`. Please reference those repos for more information:

- https://github.com/abisee/story-generation-eval (concreteness, distinct_n, sent len)
- https://github.com/dojoteef/storium-frontend (USER)


## Website template
`website_template` contains code for a basic website for running a CYOA writing task. You can include your own model generation code and code for recording and storing the task results. The places where these should go are flagged in the template.

## Demo
A demo of the website running a CYOA story writing task can be found [here](https://homes.cs.washington.edu/~eaclark7/multi-model-demo/).
