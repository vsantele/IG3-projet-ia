import random
import matplotlib.pyplot as plt

# TODO: améliorer graphs: faire 2 graphs, 1 log pour espilon, 1 linear pour dimimution et explore

eps = 0.9

evolution = []
nbDiminution = []
nbExplore = []
diminution = 0
explore = 0
factor = 2

for i in range(1000000):
    if random.uniform(0, 1) < eps:  # explore
        # diminution très lente du espilon
        explore += 1
        if eps > 0.001 and random.uniform(0, 1) < (1 - eps) ** factor:
            diminution += 1
            eps *= 0.9999
    if i % 100 == 0:
        evolution.append(eps)
        nbDiminution.append(diminution)
        nbExplore.append(explore)

fig, ax = plt.subplots(constrained_layout=True)
ax.plot(range(0, len(evolution) * 100, 100), evolution, label="epsilon")
ax2 = ax.twinx()
# ax2.secondary_yaxis("right", functions=(lambda x: x, lambda x: x))
ax2.set_ylabel("diminution", color="red")
ax2.plot(
    range(0, len(nbDiminution) * 100, 100),
    nbDiminution,
    label="diminution",
    color="red",
)

ax3 = ax.twinx()
ax3.plot(range(0, len(nbExplore) * 100, 100), nbExplore, label="explore", color="green")
ax3.set_ylabel("explore", color="green")
plt.title(factor)
plt.grid(visible=True)
plt.xscale("log")
plt.show()
