import type { LabModule } from "../../lib/types";

/** Hidden Structure section: unsupervised learning. */

export const hiddenStructureModules: LabModule[] = [
  {
    hidden: true, // temporarily hidden; delete this line to restore
    id: "similarity-lenses",
    dayId: "hidden-structure",
    title: "What Makes Things Similar?",
    subtitle: "Change the lens and watch the same objects reorganize",
    durationMin: 20,
    level: "intro",
    mission:
      "Group the same objects in different ways. There is no single correct clustering: change what features we pay attention to, and the same objects move to different neighborhoods.",
    studentInstructions: [
      "Look at the animal map, then switch the lens.",
      "Watch the animals glide to new neighborhoods.",
      "Click any animal to see the numbers behind it.",
      "Use the distance pills to check who got close to whom.",
      "Solve the whale and bat challenges."
    ],
    component: "SimilarityLenses",
    reflectionQuestions: [
      "Which choice did the lens make that a human would question?"
    ],
    noticePoints: [
      "Every animal is really a list of feature values; the lens picks which ones matter.",
      "Whale near shark (habitat) and whale near dog (biology) are BOTH correct maps.",
      "Similarity is a choice, not an objective truth."
    ],
    takeaway:
      "Clustering starts before the algorithm. The representation decides what 'similar' means.",
    underTheHood:
      "Each animal is a hand-made feature vector (size, speed, habitat, danger, legs...). A lens is just a pair of weighted feature sums used as x and y axes, normalized to the plot. Nothing is learned; the lesson is that WE choose the representation.",
    teacherNotes: [
      "Open the section with this one: it sets up everything that follows. 15 to 20 minutes.",
      "The whale is the star: fish-shaped mammal. Let the groups argue about which lens is 'right' before revealing that none is.",
      "The bat does the same trick between birds and mammals.",
      "Discussion: who chooses the features in a real system, and what do they optimize for?",
      "Bridge forward: k-means will inherit whatever representation we hand it."
    ]
  },
  {
    id: "kmeans-game",
    dayId: "hidden-structure",
    title: "K-Means: The Centroid Game",
    subtitle: "Move centers, assign points, repeat",
    durationMin: 25,
    level: "core",
    mission:
      "Control the cluster centers. K-means summarizes a dataset with k centers: each point joins the closest center, then centers move to the average of their points.",
    studentInstructions: [
      "Press 'One step' repeatedly and watch the two-move dance.",
      "Turn on assignment lines to see who belongs to whom.",
      "Drag a center somewhere silly, then let the algorithm recover.",
      "Try the bad start and the outlier dataset.",
      "Vary k on the easy blobs: what do extra centers do?"
    ],
    component: "KMeansGame",
    reflectionQuestions: [
      "Which choice did the algorithm make that a human would question?"
    ],
    noticePoints: [
      "K-means never sees groups; it only measures distances to centers.",
      "The 'total distance to centers' number always shrinks or settles, never rises.",
      "Bad starting positions can trap the centers in a bad arrangement."
    ],
    takeaway: "K-means is simple and useful, but it looks for compact groups around centers.",
    underTheHood:
      "Real k-means (Lloyd's algorithm) running live: assign every point to its nearest centroid, move each centroid to the mean of its points, repeat until nothing moves. Data are seeded 2D blobs; the only inputs are k and the starting centroids.",
    teacherNotes: [
      "The mechanism module: make every group step through slowly at least once. 20 to 25 minutes.",
      "The dance has exactly two moves: assign (points pick centers) and update (centers move to averages). Name them.",
      "The outlier dataset shows a single point hijacking a centroid: robustness preview.",
      "Bad start + run shows local minima without saying 'local minima'.",
      "Discussion: why does the cost never go up? (Each move can only improve or keep it.)"
    ],
    wide: true
  },
  {
    id: "blobs-break",
    dayId: "hidden-structure",
    title: "When Blobs Break",
    subtitle: "Moons, rings, and spirals versus nearest-center thinking",
    durationMin: 20,
    level: "core",
    mission:
      "Find a dataset where k-means gets confused. Some groups are not shaped like blobs: if the data forms moons, rings, or spirals, the nearest-center idea can break down.",
    studentInstructions: [
      "Look at the shape and PREDICT: will k-means find the human pattern?",
      "Run k-means and look at the coloring.",
      "Reveal the hidden pattern and compare.",
      "Repeat for all five datasets.",
      "Collect your score: how often were you right?"
    ],
    component: "BlobsBreak",
    reflectionQuestions: [
      "Why did nearest-centroid fail on the shapes where it failed?"
    ],
    noticePoints: [
      "K-means draws straight boundaries between centers; moons and rings do not care.",
      "The hidden pattern is a HUMAN choice; the algorithm never saw it.",
      "Failure here is not a bug: the algorithm answers a different question."
    ],
    takeaway: "Different algorithms make different assumptions about what a cluster should look like.",
    underTheHood:
      "The same k-means as the previous module, run on datasets that violate its assumption of round, compact blobs (moons, rings, spirals). The failures are genuine algorithm output, not staged.",
    teacherNotes: [
      "The predict-first flow is the point: make groups commit before running. 15 to 20 minutes.",
      "The match percentage quantifies the failure; moons typically land near 50 to 75%.",
      "The bridge dataset is subtle: k-means splits the bridge in half.",
      "Keep the energy on 'why did it fail': straight nearest-center boundaries versus connected shapes.",
      "This module exists to make students WANT the next one."
    ],
    wide: true
  },
  {
    id: "spectral-springs",
    dayId: "hidden-structure",
    title: "Spectral Springs",
    subtitle: "Connect nearby points and let structure emerge",
    durationMin: 30,
    level: "challenge",
    mission:
      "Connect nearby points with springs. A cluster is not necessarily a round blob: sometimes it is a connected structure. Tune the springs, then unfold the graph into a new map.",
    studentInstructions: [
      "Pick a dataset that broke k-means.",
      "Tune the springs: enough to hold each group together, not so many that groups touch.",
      "Watch the status line: fragmented, connected, or over-connected?",
      "Run spectral clustering and read the new map (panel 3).",
      "Beat the moons, then the rings. The bridge is the final test."
    ],
    component: "SpectralSprings",
    reflectionQuestions: [
      "Why can the same points be hard to separate in the original map and easy in the spectral map?"
    ],
    noticePoints: [
      "The springs are an intuition: nearby points pull on each other.",
      "Spectral clustering turns the neighbor graph into a new map where connected structures become easier to separate.",
      "Too few springs shatter the graph; too many merge everything: locality is a dial."
    ],
    takeaway:
      "Some structure is local. If we build a graph of nearby points, clusters can appear even when they are not round blobs.",
    underTheHood:
      "Real spectral clustering computed in your browser: connect each point to its nearest neighbors with Gaussian edge weights, build the normalized graph Laplacian, compute its first eigenvectors (Jacobi rotations), then run k-means on the rows of that embedding (the Ng-Jordan-Weiss recipe).",
    teacherNotes: [
      "The wow module. Give it time: 25 to 35 minutes.",
      "This is REAL spectral clustering (kNN Gaussian graph, normalized Laplacian, Jacobi eigenvectors, k-means in the embedding), not a canned animation.",
      "The three panels tell the story left to right: raw points, springs, unfolded map.",
      "Do not do the eigenvector math in class; 'the graph gets unfolded into a map where connected things sit together' is the honest summary.",
      "The bridge dataset is genuinely hard: springs walk across the bridge. Great discussion about ambiguous structure.",
      "Discussion: what does 'connected' mean for people in a social network?"
    ],
    wide: true
  },
  {
    hidden: true, // temporarily hidden; delete this line to restore
    id: "recommender",
    dayId: "hidden-structure",
    title: "Recommendation Engine",
    subtitle: "Rate a few items and see similarity become personalization",
    durationMin: 25,
    level: "core",
    mission:
      "Build a tiny recommender system. Rate a few items: the system builds a taste vector and recommends nearby items. Then try to create a filter bubble, or escape one.",
    studentInstructions: [
      "Rate a handful of shows with 👍 or 👎.",
      "Read your taste vector: does it describe you?",
      "Check the recommendations and their explanations.",
      "Like only one genre until the bubble warning appears.",
      "Escape the bubble with the diversity and explore knobs."
    ],
    component: "Recommender",
    reflectionQuestions: [
      "Which knob changed your recommendations the most, and would you want a real platform to expose it?"
    ],
    noticePoints: [
      "You became a vector: the average of what you liked minus what you disliked.",
      "Every recommendation has a mechanical explanation, no mind reading involved.",
      "Popularity, diversity, and exploration are BUSINESS choices wearing math clothes."
    ],
    takeaway:
      "Recommendation systems often turn people and items into vectors. Then they search for nearby things. The choice of features and scoring rule shapes what you see.",
    underTheHood:
      "No neural network: each movie is a hand-made feature vector, your ratings build a taste vector, and recommendations rank movies by cosine similarity to it, plus a small popularity boost and a diversity penalty you can toggle.",
    teacherNotes: [
      "The everyday-life payoff of the section. 20 to 25 minutes.",
      "The catalog is fictional on purpose; the mechanism is the real lesson.",
      "The filter bubble challenge lands hardest: like 3 sci-fi shows and watch the wall close in.",
      "Contradictory taste (horror + family comedy) shows the limits of a single averaged vector.",
      "Discussion: which knobs do real platforms turn, and who decides their values?",
      "Connect back to Day 1: the Meaning Map did the same thing with words."
    ],
    wide: true
  }
];
