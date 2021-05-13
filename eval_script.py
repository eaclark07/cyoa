import numpy as np
from nltk.metrics import edit_distance
import pandas as pd
import matplotlib.style
from scipy import stats
import user_metric as user
import sys
sys.path.append('story-generation-eval')
import metrics
from samples import Sample
from spacy_annotate import get_spacy_encoded_text, init_spacy

SPACY_MED = init_spacy()

matplotlib.style.use('ggplot')


def model_choice_analysis(data):
	totalWriters = len(data)
	choseModel = [0, 0, 0, 0, 0]
	print("\n============== WRITER PREFERENCE ANALYSIS ==============\n")
	results = [x.split(",")[1:] for x in data["isModelAccepted"]]
	for r in results:
		choseModel = np.add(choseModel, [x == 'true' for x in r])
	print("Overall:\t" + str(sum(choseModel)) + "/" + str(5 * totalWriters) + "\t" + str(
		sum(choseModel) / (totalWriters * 5.)))
	for i in range(len(choseModel)):
		print("Line " + str(i + 1) + ":\t" + str(choseModel[i]) + "/" + str(totalWriters) + "\t" + str(
			choseModel[i] / (totalWriters * 1.)))
	# TODO: add significance results
	return True


# https://towardsdatascience.com/overview-of-text-similarity-metrics-3397c4601f50
def get_jaccard_sim(str1, str2):
	a = set(str1.split())
	b = set(str2.split())
	c = a.intersection(b)
	return float(len(c)) / (len(a) + len(b) - len(c))


def writer_changes_analysis(data):
	ue = ['userEdits1', 'userEdits2', 'userEdits3', 'userEdits4', 'userEdits5']
	ml = ['modelLines1', 'modelLines2', 'modelLines3', 'modelLines4', 'modelLines5']
	bl = ['baselineLines1', 'baselineLines2', 'baselineLines3', 'baselineLines4', 'baselineLines5']
	ia = ['isModelAccepted1', 'isModelAccepted2', 'isModelAccepted3', 'isModelAccepted4', 'isModelAccepted5']
	mdist = {"ed": [], "js": [], "user": []}
	bdist = {"ed": [], "js": [], "user": []}

	# calculate distances for both baseline and model suggestions
	for i in range(5):
		mdist["ed"].append(data.apply(lambda x: edit_distance(x[ue[i]], x[ml[i]]), axis=1))
		bdist["ed"].append(data.apply(lambda x: edit_distance(x[ue[i]], x[bl[i]]), axis=1))
		mdist["js"].append(data.apply(lambda x: get_jaccard_sim(x[ue[i]], x[ml[i]]), axis=1))
		bdist["js"].append(data.apply(lambda x: get_jaccard_sim(x[ue[i]], x[bl[i]]), axis=1))
		# get USER f-score, multiple by 100
		mdist["user"].append(data.apply(lambda x: (user.get_diff_score(x[ue[i]], x[ml[i]])[1]['f'])*100, axis=1))
		bdist["user"].append(data.apply(lambda x: (user.get_diff_score(x[ue[i]], x[bl[i]])[1]['f'])*100, axis=1))

	accepted_dist = {}
	for k in ["overall", "model", "baseline"]:
		accepted_dist[k] = {"ed": [[],[],[],[],[]], "js": [[],[],[],[],[]], "user": [[],[],[],[],[]]}

	# filter to only keep accepted suggestions
	for j in range(5):
		for k in range(len(mdist["ed"][0])):
			if data[ia[j]][k] == "true":
				for m in ["overall", "model"]:
					for s in ["ed", "js", "user"]:
						accepted_dist[m][s][j].append(mdist[s][j][k])
			else:
				for m in ["overall", "baseline"]:
					for s in ["ed", "js", "user"]:
						accepted_dist[m][s][j].append(bdist[s][j][k])

	print("\n============== WRITER REVISION ANALYSIS ==============\n")

	total_instances = {}  # maps from entry to a concatenation of all results
	for model in accepted_dist:
		total_instances[model] = {}
		print("== " + model.upper() + " ==")
		for metric in accepted_dist[model]:
			print(metric.upper())
			print("Line-by-line results: ", [sum(x)/len(x) for x in accepted_dist[model][metric]])
			total_instances[model][metric] = np.concatenate(accepted_dist[model][metric])
			print("Average across all accepted suggestions: ", np.mean(total_instances[model][metric]))

	# calculate significance between baseline and model results using scipy.stats.mannwhitneyu
	print("== SIGNIFICANCE ==")
	comparisons = ["ed", "js", "user"]
	for c in comparisons:
		print(c + " significance:")
		print(stats.mannwhitneyu(total_instances["baseline"][c], total_instances["model"][c]))
	return True


def generated_text_metrics(data):
	ml = ['modelLines1', 'modelLines2', 'modelLines3', 'modelLines4', 'modelLines5']
	bl = ['baselineLines1', 'baselineLines2', 'baselineLines3', 'baselineLines4', 'baselineLines5']
	ul = ['userLines1', 'userLines2', 'userLines3', 'userLines4', 'userLines5']

	model_all = []
	baseline_all = []
	user_all = []

	for i in range(len(data[ml[0]])):
		m_story = ' '.join([data[ml[x]].values[i] for x in range(5)])
		m_sample = Sample({"story_text": m_story})
		m_sample.spacy_annotated_story = get_spacy_encoded_text(m_story, SPACY_MED)
		model_all.append(m_sample)

		b_story = ' '.join([data[bl[x]].values[i] for x in range(5)])
		b_sample = Sample({"story_text": b_story})
		b_sample.spacy_annotated_story = get_spacy_encoded_text(b_story, SPACY_MED)
		baseline_all.append(b_sample)

		u_story = ' '.join([data[ul[x]].values[i] for x in range(5)])
		u_sample = Sample({"story_text": u_story})
		u_sample.spacy_annotated_story = get_spacy_encoded_text(u_story, SPACY_MED)
		user_all.append(u_sample)

	model_res = {"distinct_1": [], "distinct_2": [], "distinct_3": [], "concreteness_n": [], "concreteness_v": [], "mean_sent_len":[]}
	baseline_res = {"distinct_1": [], "distinct_2": [], "distinct_3": [], "concreteness_n": [], "concreteness_v": [], "mean_sent_len":[]}
	user_res = {"distinct_1": [], "distinct_2": [], "distinct_3": [], "concreteness_n": [], "concreteness_v": [], "mean_sent_len":[]}

	for res, all in [(model_res, model_all), (baseline_res, baseline_all), (user_res, user_all)]:
		# distinct 1-2-3  _distinct_n(sample, n)
		for n in range(1, 4):
			res["distinct_"+str(n)] = [metrics._distinct_n(x, n) for x in all]

		# average sentence length
		res["mean_sent_len"] = [metrics.mean_sent_len(x) for x in all]
		# concreteness (treat None as 0 concreteness)
		res["concreteness_n"] = [metrics.mean_concreteness_noun(x) for x in all]
		res["concreteness_n"] = [x for x in res["concreteness_n"] if x!=None]
		res["concreteness_v"] = [metrics.mean_concreteness_verb(x) for x in all]
		res["concreteness_v"] = [x for x in res["concreteness_v"] if x!=None]

	print("\n============== HUMAN VS. MACHINE ANALYSIS ==============\n")

	for k in list(model_res.keys()):
		print(k)
		print("Model: ", sum(model_res[k])/len(model_res[k]))
		print("Baseline: ", sum(baseline_res[k])/len(baseline_res[k]))
		print("Human: ", sum(user_res[k])/len(user_res[k]))
	return True


def likert_analysis(df):
	print("\n============== LIKERT SCORE ANALYSIS ==============\n")
	q = ["Q1", "Q2", "Q3", "Q4", "Q5"]
	print(df[q].describe())
	return True


if __name__ == "__main__":
	afile = sys.argv[1]
	df = pd.read_table(afile, index_col=0)
	model_choice_analysis(df)
	writer_changes_analysis(df)
	generated_text_metrics(df)
	likert_analysis(df)
