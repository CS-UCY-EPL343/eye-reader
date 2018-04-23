/**
 * @module backend
 * @description Backend server of eyeReader application.
 */
var express = require('express');
var app = express();

const PORT = process.env.PORT || 80;

var Article= loadArticleData ();
var Source= loadSourceData ();
var About;

// Enable Cross-Origin Resource Sharing (CORS)
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

/**
 * @module get
 * @memberof backend
 * @return {string} 'EyeReader Backend Restful Service!'
 */
app.get('/', function (req, res) {
  res.send('EyeReader Backend Restful Service!');
});

/**
 * @module get/sources
 * @memberof backend
 * @return {JSON} JSON file with all the sources
 */
app.get('/sources/', function (req, res) {
  res.json(Source);
});

app.get('/sources/:title/', function (req, res) {
	let i;
	for (i=0; i<Source.length; i++) {
		// Handle undefined
		if (Source[i].Title.localeCompare(req.params.title)== 0) {
			res.json(Source[i]);
			break;
		}
	}
  res.json({"Message" : "Error: There is no source with the requested Title."});
});

app.get('/sources/:SourceTitle/click/', function (req, res) {
  let sumClicks= 0;
  let i;
	for (i=0; i<Article.length; i++) {
		if (Article[i].SourceTitle.localeCompare(req.params.SourceTitle)== 0) {
			// Handle undefined
			sumClicks= sumClicks + Article[i].clickCount;
		}
	}
	res.send(sumClicks.toString());
});

app.get('/sources/:SourceTitle/report/', function (req, res) {
  let sumReports= 0;
  let i;
	for (i=0; i<Article.length; i++) {
		if (Article[i].SourceTitle.localeCompare(req.params.SourceTitle)== 0) {
			// Handle undefined
			sumReports= sumReports + Article[i].reportCount;
		}
	}
	
	res.send(sumReports.toString());
});

app.get('/sources/:SourceTitle/sentimentalAnalysis/', function (req, res) {
  let sum= 0;
  let i;
	for (i=0; i<Article.length; i++) {
		if (Article[i].SourceTitle.localeCompare(req.params.SourceTitle)== 0) {
			// Handle undefined
			sum= sum + Article[i].SentimentGrade;
		}
	}
	
	res.send(sum.toString());
});

/**
 * @module get/about
 * @memberof backend
 * @return {string} 'Readme + Licence + Credits'
 */
app.get('/about/', function (req, res) {
  res.send(About);
});

/**
 * @module get/articles
 * @memberof backend
 * @return {JSON} JSON file with all the articles
 */
app.get('/articles/', function (req, res) {
  res.json(Article);
});

app.get('/articles/from/:SourceTitle/', function (req, res) {
	let i;
	let listArticles= [];
	for (i=0; i<Article.length; i++) {
		if (Article[i].SourceTitle.localeCompare(req.params.SourceTitle)== 0) {
			// Handle undefined
			listArticles.push (Article[i]);
		}
	}
	if (listArticles.length== 0) {
		res.json({"Message" : "There are no articles with the requested Source."});
	} else {
		res.json(listArticles);
	}
});

app.get('/articles/:Id/', function (req, res) {
	let i;
	for (i=0; i<Article.length; i++) {
		if (Article[i].Id== req.params.Id) {
			// Handle undefined
			res.json(Article[i]);
			break;
		}
	}
  res.json({"Message" : "Error: There is no article with the requested ID."});
});

/**
 * @module get/articles/id/click
 * @memberof backend
 * @param {int} id - The ID of the Article clicked
 * @description Increase by 1 the click counter for the specific (:id) article
 */
app.get('/articles/:Id/click/', function (req, res) {
	//click_count++
	let i;
	for (i=0; i<Article.length; i++) {
		if (Article[i].Id== req.params.Id) {
			// Handle undefined
			Article[i].clickCount= Article[i].clickCount + 1;
			res.json({"Message" : "Success"});
			break;
		}
	}
  res.json({"Message" : "Error: There is no article with the requested ID."});
});

/**
 * @module get/articles/id/report
 * @memberof backend
 * @param {int} id - The ID of the Article reported
 * @description Increase by 1 the report counter for the specific (:id) article
 */
app.get('/articles/:Id/report/', function (req, res) {
	//report_count++
  let i;
	for (i=0; i<Article.length; i++) {
		if (Article[i].Id== req.params.Id) {
			// Handle undefined
			Article[i].reportCount= Article[i].reportCount + 1;
			res.json({"Message" : "Success"});
			break;
		}
	}
  res.json({"Message" : "Error: There is no article with the requested ID."});
});

app.listen(PORT, function () {
  console.log('Example app listening on port' + PORT + '!');
});

function loadArticleData () {
	let templateArticles= [];

	templateArticle= {};
	templateArticle.URL= 'https://techblog.gr/b2b/apple-record-quarter-profits-2722/';
	templateArticle.Title= 'H Apple σπάει ρεκόρ κερδών για το τέταρτο οικονομικό τρίμηνο';
	templateArticle.PictureSrc= '/templateArticles/TempArticlePicture.jpg';
	templateArticle.Content= 'Μαζί με την επίσημη κυκλοφορία του επετειακού iPhone X, η Apple ανακοίνωσε εχθές τα κέρδη τριμήνου καταφέρνοντας να ξεπεράσει τις προσδοκίες της Wall Street. Το τμήμα Υπηρεσιών της κατάφερε να κάνει το καλύτερο τρίμηνο ever.\n\nΚατά τη διάρκεια Ιουλίου – Σεπτεμβρίου, η Apple πούλησε 46.7 εκατ. iPhone και τα έσοδα που σχετίζονται με τα smartphones ανήλθαν σε 28.85 δισ. δολάρια. Την ίδια περίοδο πέρσι, οι πωλήσεις iPhones ήταν στα 45.5 εκατ. με έσοδα 28.16 δισ. δολάρια.\n\nH Apple κατάφερε επίσης να ανεβάσει και τις πωλήσεις iPads, από 9.27 εκατ. πέρσι, φέτος έφτασαν τα 10.3 εκατ. με έσοδα 4.83 δισ. δολάρια και αύξηση 14%.\n\nΤο τμήμα Υπηρεσιών που περιλαμβάνει iTunes, Apple Pay and the App Store, ήταν αυτό που έσπασε ρεκόρ τριμήνου με έσοδα 8.5 δισ. δολάρια.\n\nΣυνολικά η Apple ανακοίνωσε 10.7 δισ. δολάρια σε καθαρά κέρδη για το τέταρτο τρίμηνο του οικονομικού της έτους με κέρδη 2.07 δολάρια ανά μετοχή. Οι εκτιμήσεις της Wall Street ήταν 1.87 δολάρια ανά μετοχή. Τα έσοδα αυξήθηκαν κατά 12% στα 52.6 δισ. δολάρια. Το ίδιο τρίμηνο πέρσι, η Apple είχε έσοδα 46.9 δολάρια (1.67 ανά μετοχή).\n\nΓια το επόμενο τρίμηνο, που περιλαμβάνει Thanksgiving, Black Friday και Χριστούγεννα, η Apple αναμένει σημαντική άνοδο με έσοδα 84-87 δισ. δολαρίων και μικτό περιθώριο κέρδους 38%.\n\nΜετά την ανακοίνωση των αποτελεσμάτων, η μετοχή της Apple ανέβηκε κατά 5% στα 174 δολάρια, αυτό σημαίνει ότι σημείωσε νέο ρεκόρ και η Apple είναι ένα βήμα πιο κοντά στο να γίνει η πρώτη εταιρεία αξίας 1 τρις. δολαρίων. Αυτή τη στιγμή είναι στα 900 δισ. δολάρια.';
	templateArticle.Author= 'Λορένα Σιούτη';
	templateArticle.Date= '04/11/2017';
	templateArticle.SourceTitle= 'Techblog.gr';
	templateArticle.Category= 'Technology';
	templateArticle.Id= 1;
	templateArticle.SentimentGrade= 0;
	templateArticle.comments= [];
	templateArticle.comments.push({Name: "Bill Gates", Content: "Great Article !!!"});
	templateArticle.comments.push({Name: "Elon Musk", Content: "Awesome Article !!!"});
	templateArticle.NegativeWords= [];
	templateArticle.NegativeWords.push("***");
	templateArticle.clickCount= 0;
	templateArticle.reportCount= 0;

	templateArticles.push(templateArticle);

	templateArticle= {};
	templateArticle.URL= 'https://techblog.gr/mobile/apple-iphone-x-sold-out-in-three-minutes-in-south-korea-3881/';
	templateArticle.Title= 'Apple iPhone X: Ξεπούλησε ταχύτατα στην Νότια Κορέα';
	templateArticle.PictureSrc= '/templateArticles/iPhone-X-hands.jpg';
	templateArticle.Content= 'Το iPhone X έχει γίνει ανάρπαστο παγκοσμίως, κάτι που δικαιολογεί και την μεγάλη έλλειψη αποθέματος. Μπορεί όσο περνάει ο καιρός η αγορά του επετειακού μοντέλου να γίνεται πιο εύκολη, δεν παύει όμως να ξεπουλάει σε μερικές αγορές του κόσμου. Τελευταία ήταν η Νότια Κορέα, μητέρα πατρίδα των Samsung και LG. Σε ένα κράτος του οποίου τα εγχώρια smartphones κατακτούν τον πλανήτη, θα περίμενε κανείς πως οι κάτοικοι προτιμούν τις συσκευές που οι ίδιοι (οι οι συμπολίτες τους) κατασκευάζουν. Αυτό δεν φαίνεται να ισχύει στην περίπτωση της Νότιας Κορέας, χώρας από την οποία προέρχονται οι Samsung / LG και κατά συνέπεια τα κινητά τους τηλέφωνα. Με προτάσεις όπως τα Galaxy S8 / S8+, Note 8 ή V30, οι Κορεάτες έχουν παράδοση στην κατασκευή high-end smartphones. Φυσικά, διαθέτουν επίσης ανταγωνιστικά μοντέλα τόσο στην mid-range, όσο και στην low-budget κατηγορία. Όσο καλές και αν είναι οι συσκευές τους όμως, αρκετοί προτιμούν τον μεγάλο αντίπαλο, την Apple, και φέτος συγκεκριμένα το iPhone X. Μάλιστα, η ζήτηση για το επετειακό iPhone όχι μόνο ήταν μεγάλη, αλλά οδήγησε σε πλήρες ξεπούλημα του διαθέσιμου αποθέματος μέσα σε μόλις τρια λεπτά. Σύμφωνα με τον μεγαλύτερο πάροχο τηλεφωνίας της Νότιας Κορέας, την SK Telecom, η ασημένια έκδοση του iPhone X ξεπούλησε μέσα σε ένα λεπτό (!), ενώ εκείνη με την μαύρη πλάτη “έφυγε” τα επόμενα δυο λεπτά. Συνολικά διαθέσιμα υπήρχαν 150 χιλιάδες μοντέλα, τα μισά από τον συνολικό αριθμό των iPhone 8 / 8 Plus όταν αρχικά διατέθηκαν στο κοινό. Σύμφωνα με αναλυτές, το ενδιαφέρον γύρω από τις δυο iPhone 8 εκδόσεις την Νότια Κορέα έπεσε κατά 30-40% συγκριτικά με τα iPhone 7 / 7 Plus την περασμένη χρονιά, με το iPhone X να θεωρείται ο κύριος υπαίτιος, κάτι που τελικά αποδείχθηκε από τον ταχύτατο ρυθμό με τον οποίο ξεπούλησαν οι ομώνυμες παρτίδες. Φαίνεται πως παρά την προσπάθεια των Samsung και LG να πείσουν τις αγορές των Η.Π.Α. και Ευρώπης να προτιμήσουν τα δικά τους smartphones έναντι (κυρίως) των προτάσεων της Apple, τελικά ακόμα και οι εγχώριοι καταναλωτές έχουν… κατά βάθος μια μικρή συμπάθεια για τα προϊόντα του κολοσσού του Cupertino.';
	templateArticle.Author= 'Λορένα Σιούτη';
	templateArticle.Date= '17/11/2017';
	templateArticle.SourceTitle= 'Techblog.gr';
	templateArticle.Category= 'Technology';
	templateArticle.Id= 2;
	templateArticle.SentimentGrade= 0;
	templateArticle.comments= [];
	templateArticle.comments.push({Name: "Bill Gates", Content: "Great Article !!!"});
	templateArticle.comments.push({Name: "Elon Musk", Content: "Awesome Article !!!"});
	templateArticle.NegativeWords= [];
	templateArticle.NegativeWords.push("***");
	templateArticle.clickCount= 0;
	templateArticle.reportCount= 0;

	templateArticles.push(templateArticle);

	templateArticle= {};
	templateArticle.URL= 'https://techblog.gr/mobile/apple-iphone-x-now-works-in-cold-weather-2348/';
	templateArticle.Title= 'Apple iPhone X: Πλέον λειτουργεί και σε κρύο περιβάλλον';
	templateArticle.PictureSrc= '/templateArticles/iPhone-X-revealed01.jpg';
	templateArticle.Content= 'Το iPhone X είναι διαθέσιμο σε περιορισμένο απόθεμα εδώ και μερικές ημέρες. Μέχρι στιγμής, εκατομμύρια καταναλωτές ανά τον κόσμο έχουν δείξει την προτίμηση τους στο νέο smartphone, από το οποίο όμως δεν λείπουν μικρά προβλήματα και δυσλειτουργίες, όπως πια συμβαίνει σε κάθε high-end smartphone που… σέβεται τον εαυτό του. Ένα εκ των ζητημάτων που είχαν προκύψει ήταν η αδυναμία πολλών κατόχων να χρησιμοποιήσουν την συσκευή σε περιβάλλον με χαμηλή θερμοκρασία. Η οθόνη δεν ανταποκρίνονταν στις εντολές που έδινε ο χρήστης με το δάχτυλο του και ουσιαστικά το κινητό δεν μπορούσε να προχωρήσει στην επιτέλεση λειτουργιών. Η Apple δήλωσε πως είναι ενήμερη για το θέμα και υποσχέθηκε να φέρει την λύση μέσω ενημέρωσης λογισμικού. Η ενημέρωση αυτή είναι το iOS 11.1.2 και διατίθεται πλέον για λήψη. Συγκεκριμένα, το 11.1.2 περιέχει μόνο διορθώσεις, οι οποίες μάλιστα αφορούν μόνο το iPhone X. Η μια είναι η προαναφερθείσα, ενώ η δεύτερη αφορά μια αλλοίωση που παρατηρούνταν στην ποιότητα της λήψης Live Photos και βίντεο από το επετειακό smartphone του Cupertino. Φαίνεται πως δεν υπάρχει άλλη βελτίωση που έρχεται μαζί με την νεότερη έκδοση του iOS, αλλά καλό είναι να εγκατασταθεί σε όλες τις Apple συσκευές, ανεξάρτητα από το αν εκείνη απευθύνεται κυρίως στο X. Η αλήθεια είναι πως το iPhone X δεν έχει παρουσιάσει σοβαρά και μεγάλα προβλήματα μέχρι τώρα. Οι πράσινες κάθετες γραμμές που εμφανίστηκαν σε μια παρτίδα δεν επηρεάζουν μεγάλο αριθμό χρηστών και σε γενικές γραμμές η κυκλοφορία του smartphone, που λόγω τόσων αλλαγών συγκριτικά με τους προκατόχους του θα δικαιολογούσε δυσλειτουργίες (όσο μπορούν να δικαιολογηθούν), κυλάει ομαλά. Βέβαια είναι ακόμα νωρίς, ενδέχεται να έρθουν στην επιφάνεια άλλα προβλήματα με την πάροδο του χρόνου, ένα εξ’ αυτών θα μπορούσε να είναι το πρόωρο burn-in της οθόνης. Η αξιοπιστία του iPhone X θα αποδειχθεί στο μέλλον.';
	templateArticle.Author= 'Λορένα Σιούτη';
	templateArticle.Date= '17/11/2017';
	templateArticle.SourceTitle= 'Techblog.gr';
	templateArticle.Category= 'Technology';
	templateArticle.Id= 3;
	templateArticle.SentimentGrade= 0;
	templateArticle.comments= [];
	templateArticle.comments.push({Name: "Bill Gates", Content: "Great Article !!!"});
	templateArticle.comments.push({Name: "Elon Musk", Content: "Awesome Article !!!"});
	templateArticle.NegativeWords= [];
	templateArticle.NegativeWords.push("***");
	templateArticle.clickCount= 0;
	templateArticle.reportCount= 0;

	templateArticles.push(templateArticle);

	templateArticle= {};
	templateArticle.URL= 'https://techblog.gr/mobile/iphone-x-waiting-time-2-to-3-weeks-7213/';
	templateArticle.Title= 'iPhone X: Στις 2-3 εβδομάδες ο χρόνος αναμονής';
	templateArticle.PictureSrc= '/templateArticles/iphonexfamly-TA.jpg';
	templateArticle.Content= 'Το iPhone X είναι από τα πιο πολυσυζητημένα μοντέλα της Apple, μιας και η ίδια μπαίνει σε μια νέα εποχή με την αλλαγή στο design. Ανακοινώθηκε Σεπτέμβριο, αλλά οι πωλήσεις ξεκίνησαν στις 3 Νοεμβρίου, αλλά η ζήτηση ήταν αρκετά μεγάλη. Η ζήτηση (που ξεπέρασε τις προσδοκίες της Apple) σε συνδυασμό με τα διάφορα προβλήματα που λέγεται ότι είχε η Apple κατά την παραγωγή, ανέβασαν τους χρόνους αναμονής για το iPhone X στις 5-6 εβδομάδες. Ωστόσο, πλέον όσοι παραγγείλουν το iPhone X, σύμφωνα με τις εκτιμήσεις της Apple ο χρόνος αναμονής πέφτει πλέον στις 2-3 εβδομάδες. Φαίνεται πως η Apple καταφέρνει να βρει μια καλύτερη ισορροπία όσον αφορά στην ζήτηση και την παραγωγή. Το iPhone X διατίθεται σε Space Gray ή Silver με ενσωματωμένη μνήμη 64GB ή 256GB και την τιμή του στην Ελλάδα να είναι 1199 ευρώ και 1399 ευρώ, αντίστοιχα. Τις τρεις πρώτες μέρες, οι παραγγελίες του iPhone X εκτιμάται ότι έφτασαν τα 9-12 εκατ. Θα έχει ενδιαφέρον να δούμε πόσος θα είναι ο συνολικός αριθμός πωλήσεων για τ τρίμηνο.';
	templateArticle.Author= 'Λορένα Σιούτη';
	templateArticle.Date= '16/11/2017';
	templateArticle.SourceTitle= 'Techblog.gr';
	templateArticle.Category= 'Technology';
	templateArticle.Id= 4;
	templateArticle.SentimentGrade= 0;
	templateArticle.comments= [];
	templateArticle.comments.push({Name: "Bill Gates", Content: "Great Article !!!"});
	templateArticle.comments.push({Name: "Elon Musk", Content: "Awesome Article !!!"});
	templateArticle.NegativeWords= [];
	templateArticle.NegativeWords.push("***");
	templateArticle.clickCount= 0;
	templateArticle.reportCount= 0;

	templateArticles.push(templateArticle);

	templateArticle= {};
	templateArticle.URL= 'https://techblog.gr/computers/china-has-more-supercomputers-than-anyone-2720/';
	templateArticle.Title= 'Η Κίνα έχει τους περισσότερους υπερυπολογιστές στον πλανήτη';
	templateArticle.PictureSrc= '/templateArticles/supercomputers.jpg';
	templateArticle.Content= 'Η Κίνα είναι αυτή που έχει πλέον τους περισσότερους υπερυπολογιστές από κάθε άλλη χώρα στον πλανήτη. Οι Κινέζοι παίρνουν την πρωτιά από τις ΗΠΑ στην λίστα με τους 500 ισχυρότερους supercomputers στον κόσμο. Πριν από ένα εξάμηνο, οι ΗΠΑ ήταν στην πρώτη θέση με 169 supercomputers, ενώ η Κίνα είχε 10 λιγότερους (159). Ωστόσο, μέσα σε πολύ μικρό χρονικό διάστημα οι Κινέζοι κατάφεραν να φτάσουν στους 202 και οι ΗΠΑ έπεσαν στους 144. Μετά τις ΗΠΑ και την Κίνα, οι οποίες προηγούνται αρκετά, τρίτη είναι η Ιαπωνία με 35 υπερυπολογιστές, ακολουθεί η Γερμανία με 20, η Γαλλία με 18 στην 5η θέση και η Βρετανία με 15. Για πρώτη φορά και οι δέκα ισχυρότεροι υπερυπολογιστές έχουν ο καθένας ισχύ άνω των 10 petaflops. Στην κορυφή βρίσκεται ο κινεζικός Sunway TaihuLight με επεξεργαστική ισχύ 93 petaflops/sec (χίλια τρισεκατομμύρια υπολογισμοί ανά δευτερόλεπτο). Δεύτερος είναι ο κινεζικός Tianhe-2 (33,9 petaflop/sec),στην τρίτη θέση είναι ο ελβετικός Piz Daint (19,6 petaflop/sec, ο πιο ισχυρός ευρωπαϊκός υπερυπολογιστής), ο ιαπωνικός Gyoukou (19,1 petaflop/sec) και ο αμερικανικός Titan (17,6 petaflop/sec) κλείνουν την πεντάδα. Τα supercomputers είναι τεράστια μηχανήματα που καταλαμβάνουν ολόκληρα δωμάτια και μπορούν να επεξεργαστούν τεράστιο όγκο δεδομένων που δεν μπορεί να συγκριθεί με τους υπολογιστές που έχουμε στην καθημερινότητά μας. Χρησιμοποιούνται για την δημιουργία χαρτών του σύμπαντος, την μελέτη των κλιματικών αλλαγών, προσομοίωση πυρηνικών και άλλων όπλων, έρευνες για πετρέλαιο, ανάλυση DNA κλπ. H συνολική ισχύς των 500 ισχυρότερων συστημάτων αγγίζει τα 845 petaflops έναντι 749 petaflops πριν έξι μήνες και 672 petaflops το 2016. Από αυτή τη συνολική ισχύ, το 35,4% ανήκει στην Κίνα και το 29,6% στις ΗΠΑ. To όριο για να συμπεριληφθεί ένας υπερυπολογιστής στο Top 500, έχει αυξηθεί στα 548 teraflops από 432 teraflops τον Ιούνιο. Στον συμπληρωματικό κατάλογο Top Green 500 με τους πιο «πράσινους» και λιγότερο ενεργοβόρους υπερυπολογιστές προηγούνται τρεις από την Ιαπωνία.';
	templateArticle.Author= 'Λορένα Σιούτη';
	templateArticle.Date= '16/11/2017';
	templateArticle.SourceTitle= 'Techblog.gr';
	templateArticle.Category= 'Technology';
	templateArticle.Id= 5;
	templateArticle.SentimentGrade= 0;
	templateArticle.comments= [];
	templateArticle.comments.push({Name: "Bill Gates", Content: "Great Article !!!"});
	templateArticle.comments.push({Name: "Elon Musk", Content: "Awesome Article !!!"});
	templateArticle.NegativeWords= [];
	templateArticle.NegativeWords.push("***");
	templateArticle.clickCount= 0;
	templateArticle.reportCount= 0;

	templateArticles.push(templateArticle);

	templateArticle= {};
	templateArticle.URL= 'https://techblog.gr/gadgets/apple-is-the-top-wearable-manufacturer-4928/';
	templateArticle.Title= 'Apple: Ξανά ο κορυφαίος πωλητής wearables παγκοσμίως';
	templateArticle.PictureSrc= '/templateArticles/apple-watch-series-3-1.jpg';
	templateArticle.Content= 'Η Apple αδιαμφισβήτητα είναι ένας εκ των κορυφαίων κατασκευαστών παγκοσμίως. Τα προϊόντα της γίνονται ανάρπαστα και το ίδιο φαίνεται πως ισχύει με την οικογένεια της από wearables, τις σειρές Apple Watch. Από τα μέσα του 2015 όπου και διατέθηκαν για πρώτα φορά τα smartwatches της Apple, ο Αμερικανός κολοσσός έχει καταφέρει να σκαρφαλώσει στην κορυφή της σχετικής λίστας με τους κατασκευαστές που κατέχουν τις περισσότερες πωλήσεις wearables. Σύμφωνα με νέα έρευνα της εταιρείας Canalys, το τρίτο τρίμηνο της χρονιάς απεστάλησαν 17.3 εκατομμύρια έξυπνα βραχιόλια / ρολόγια και ο πρώτος πωλητής ήταν το Cupertino. Φαίνεται πως η νέα σειρά Apple Watch Series 3 έπεισε αρκετούς χιλιάδες καταναλωτές ώστε να δώσουν στην Apple την πρωτιά (που είχε χάσει τους προηγούμενους μήνες) και συνολικά το 23% των 17.3 εκατομμυρίων, δηλαδή περίπου τέσσερα εκατομμύρια αποστολές Apple Watches, με τις 800 χιλιάδες εξ’ αυτών να είναι cellular Series 3 μοντέλα. Ακριβώς πίσω από τους Αμερικάνους βρίσκεται η Xiaomi με 3.6 εκατομμύρια wearables (21%). Ακολουθούν οι Fitbit με 20%, Huawei με 6% και τέλος η Samsung με 5%. Το υπόλοιπο 25% είναι προϊόντα άλλων κατασκευαστών οι οποίοι δεν έχουν ισχυρό ποσοστό μόνοι τους. Αξίζει να σημειωθεί πως η διαφορά τιμής των wearables της Xiaomi με τα αντίστοιχα της Apple (ο πρώτος και δεύτερος της λίστας) είναι χαοτική. Αρκεί να λάβει κανείς υπόψιν του πως σε γνωστή αλυσίδα καταστημάτων της Ελλάδας, το Xiaomi Mi Band 2 (η καλύτερη πρόταση της εταιρείας) κοστίζει 40 ευρώ, ενώ το Apple Watch Series 3 χωρίς cellular modem για συνδεσιμότητα με πάροχο τηλεφωνίας ξεκινάει από 400 ευρώ. Παρά την τεράστια απόκλιση όμως η Apple έρχεται πρώτη παγκοσμίως. Η αλήθεια είναι πως η cellular έκδοση των Series 3 έξυπνων ρολογιών μπορεί να αποβεί εξαιρετικά χρήσιμη. Αυτός πιθανόν να είναι και ο λόγος που η Apple ανέκτησε τα ηνία της κορυφής το τρίτο εξάμηνο της χρονιάς. Μένουν άλλοι τρεις μήνες για να πέσει η αυλαία του 2017. Ίσως η κατάσταση διαφοροποιηθεί. Ίσως πάλι, με τα Series 3 να βρίσκονται σε πλήρη διαθεσιμότητα κοντά στην περίοδο των Χριστουγέννων, η Apple να αυξήσει ακόμα περισσότερο την ψαλίδα από τους ανταγωνιστές';
	templateArticle.Author= 'Λορένα Σιούτη';
	templateArticle.Date= '15/11/2017';
	templateArticle.SourceTitle= 'Techblog.gr';
	templateArticle.Category= 'Technology';
	templateArticle.Id= 6;
	templateArticle.SentimentGrade= 0;
	templateArticle.comments= [];
	templateArticle.comments.push({Name: "Bill Gates", Content: "Great Article !!!"});
	templateArticle.comments.push({Name: "Elon Musk", Content: "Awesome Article !!!"});
	templateArticle.NegativeWords= [];
	templateArticle.NegativeWords.push("***");
	templateArticle.clickCount= 0;
	templateArticle.reportCount= 0;

	templateArticles.push(templateArticle);

	templateArticle= {};
	templateArticle.URL= 'https://techblog.gr/software/firefox-quantum-faster-version-available-3732/';
	templateArticle.Title= 'Firefox Quantum: Διαθέσιμη η ταχύτερη έκδοση μέχρι σήμερα';
	templateArticle.PictureSrc= '/templateArticles/firefox-quantum-01.jpg';
	templateArticle.Content= 'Η Mozilla εργαζόταν εδώ και καιρό για την δημιουργία της νέας έκδοσης Firefox Quantum, η οποία βγήκε από την φάση beta και είναι πλέον διαθέσιμη. Σύμφωνα με την Mozilla, ο νέος Firefox είναι δυο φορές πιο γρήγορος απ ότι πριν από 6 μήνες. Η σημαντική αύξηση στην ταχύτητα επιτυγχάνεται χάρη στην χρήση νέου browsing engine, επίσης έχει multi-process αρχιτεκτονική που επιτρέπει την χρήση περίπου 30% λιγότερης μνήμης RAM από τον Chrome της Google. Επιπλέον, το Tab switching είναι ταχύτερο από ποτέ. Εκτός από την βελτίωση στην ταχύτητα, ο Firefox Quantum έχει και νέο deisgn. O browser σου επιτρέπει να κάνεις ένα screenshot και να το μοιραστείς, χωρίς να απαιτείται η χρήση third party app ή add-on. Το Pocket service είναι ενσωματωμένο στην toolbar, για να αποθηκεύσεις ότι θέλεις για αργότερα. Στη βιβλιοθήκη του νέου browser θα βρεις το περιεχόμενο που θέλεις όπως Pocket saves, bookmarks, browsing history, screenshots και downloads – τα οποία είναι πλέον προσβάσιμα από ένα σημείο. Φυσικά, ο Firefox συνεχίζει να υποστηρίζει extensions και themes. Η toolbar είναι παραμετροποιήσιμη μέσω drag and drop. Όπως και προηγουμένως, μπορείς να συγχρονίσεις passwords, bookmarks και άλλα data μεταξύ διάφορων συσκευών. Το Send Tabs feature σου επιτρέπει να μοιράζεσαι άμεσα ανοιχτά tabs μεταξύ του υπολογιστή, του κινητού και του tablet σου. Ο Firefox Quantum είναι διαθέσιμος για download για τον υπολογιστή η την iOS/Android συσκευή.';
	templateArticle.Author= 'Λορένα Σιούτη';
	templateArticle.Date= '15/11/2017';
	templateArticle.SourceTitle= 'Techblog.gr';
	templateArticle.Category= 'Technology';
	templateArticle.Id= 7;
	templateArticle.SentimentGrade= 0;
	templateArticle.comments= [];
	templateArticle.comments.push({Name: "Bill Gates", Content: "Great Article !!!"});
	templateArticle.comments.push({Name: "Elon Musk", Content: "Awesome Article !!!"});
	templateArticle.NegativeWords= [];
	templateArticle.NegativeWords.push("***");
	templateArticle.clickCount= 0;
	templateArticle.reportCount= 0;

	templateArticles.push(templateArticle);

	templateArticle= {};
	templateArticle.URL= 'http://www.techgear.gr/tesla-roadster-announced-129235/';
	templateArticle.Title= 'Tesla Roadster: Το νέο ηλεκτρικό supercar πιάνει 0-100km σε μόλις 1.9sec!';
	templateArticle.PictureSrc= '/templateArticles/Roadster_Targa_Open-1.jpg';
	templateArticle.Content= 'Η έκπληξη που υποσχέθηκε ο Elon Musk στην παρουσίαση του Tesla Semi ήταν εντυπωσιακή. Το δεύτερης γενιάς Tesla Roadster, ένα πανέμορφο και πλήρως ηλεκτρικό convertible που θα κυκλοφορήσει το 2020. Από το βασικό του μοντέλο, το νέο Tesla Roadster θα προσφέρει στον οδηγό απίστευτες δυνατότητες, όπως ταχύτητα 0-100 μέσα σε μόλις 1.9sec και αυτονομία 1000km με μία φόρτιση (μπαταρία 200kWh). Διαθέτει δύο ηλεκτρικούς κινητήρες και αποδίδει ροπή 10.000 Nm, αριθμός που κανένα βενζινοκίνητο supercar δεν μπορεί να φτάσει σήμερα. Επιπλέον, έχει χώρο για τέσσερα άτομα (λίγο στριμωχτά στο πίσω κάθισμα βέβαια) και ανοιγόμενη οροφή. Η τιμή του θα ξεκινά από τα $200.000 με $50.000 προκαταβολή ή $250.000 για τους πρώτους 1000. Μένει να δούμε αν η Tesla θα καταφέρει να ικανοποιήσει τη ζήτηση με δεδομένο ότι ταυτόχρονα θα κατασκευάζει το Tesla Model 3, το Tesla Semi και το Tesla Roadster.';
	templateArticle.Author= 'Chris Elpidis';
	templateArticle.Date= '17/11/2017';
	templateArticle.SourceTitle= 'Techgear.gr';
	templateArticle.Category= 'Technology';
	templateArticle.Id= 8;
	templateArticle.SentimentGrade= 0;
	templateArticle.comments= [];
	templateArticle.comments.push({Name: "Bill Gates", Content: "Great Article !!!"});
	templateArticle.comments.push({Name: "Elon Musk", Content: "Awesome Article !!!"});
	templateArticle.NegativeWords= [];
	templateArticle.NegativeWords.push("***");
	templateArticle.clickCount= 0;
	templateArticle.reportCount= 0;

	templateArticles.push(templateArticle);

	templateArticle= {};
	templateArticle.URL= 'http://www.techgear.gr/vimeo-hdr-and-8k-videos-support-129170/';
	templateArticle.Title= 'Vimeo: Η υπηρεσία υποστηρίζει πλέον HDR και 8K videos';
	templateArticle.PictureSrc= '/templateArticles/vimeo_hdr_8k.jpg';
	templateArticle.Content= 'Νέα αναβάθμιση για την υπηρεσία Vimeo, η οποία ανακοίνωσε πριν από λίγο ότι πλεόν υποστηρίζει HDR videos και αναλύσεις έως 8K. Προφανώς για 8K δεν γίνεται λόγος αυτή την περίοδο, αλλά τα HDR videos είναι αρκετά διαδεδομένα και μπορείς να τα παρακολουθήσεις αν έχεις συσκευή που υποστηρίζει το HEVC codec μέσω HDR10 (π.χ. Apple TV 4K, iPhone X, iPad Pro). Εξάλλου, η υπηρεσία υπόσχεται ότι σύντομα θα υποστηρίζει HDR και για περισσότερα video formats (π.χ. VP9 και AV1) και φυσικά θα είναι εφικτό το download σε όποια videos επιτρέπουν οι δημιουργοί. Σαν καθημερινοί χρήστες μην περιμένετε ότι θα δείτε κάποια δραματική αλλαγή, αλλά όσοι ασχολείστε με την δημιουργία video είναι σίγουρα ευχάριστο ότι μπορείτε να ανεβάζετε τα έργα σας σε τόσο υψηλή ανάλυση.';
	templateArticle.Author= 'Scorpion';
	templateArticle.Date= '16/11/2017';
	templateArticle.SourceTitle= 'Techgear.gr';
	templateArticle.Category= 'Technology';
	templateArticle.Id= 9;
	templateArticle.SentimentGrade= 0;
	templateArticle.comments= [];
	templateArticle.comments.push({Name: "Bill Gates", Content: "Great Article !!!"});
	templateArticle.comments.push({Name: "Elon Musk", Content: "Awesome Article !!!"});
	templateArticle.NegativeWords= [];
	templateArticle.NegativeWords.push("***");
	templateArticle.clickCount= 0;
	templateArticle.reportCount= 0;

	templateArticles.push(templateArticle);

	templateArticle= {};
	templateArticle.URL= 'http://www.techgear.gr/google-maps-redesign-129152/';
	templateArticle.Title= 'Google Maps: Ανανέωση της εμφάνισης για ευκολότερη πλοήγηση';
	templateArticle.PictureSrc= '/templateArticles/google_maps_redesign.jpg';
	templateArticle.Content= 'Η Google ανανεώνει την εμφάνισης της υπηρεσίας Google Maps με νέα εικονίδια, νέα χρώματα και περισσότερες πληροφορίες που θα μπορούν να βοηθήσουν τους χρήστες στην οργάνωση και στην πορεία του ταξιδιού τους με μεγαλύτερη ευκολία. \n\n“Καταρχήν, αναβαθμίσαμε τις λειτουργίες πλοήγησης, τις πληροφορίες για τα μέσα μαζικής μεταφοράς, την κυκλοφορία και την αναζήτηση για να τονίζουμε περισσότερο αυτά που ενδιαφέρουν τον χρήστη (π.χ. βενζινάδικα, σταθμούς τραίνων κλπ.). Επίσης, αναβαθμίσαμε τα χρώματα τις υπηρεσίας και προσθέσαμε νέα εικονίδια για να αναγνωρίζετε εύκολα και γρήγορα τα καφέ, εστιατόρια, ξενοδοχεία, μουσεία, εκκλησίες κλπ. με ξεχωριστό χρωματισμό για κάθε κατηγορία” \n\n Να σημειωθεί ότι οι αλλαγές θα εμφανιστούν σταδιακά σε όλους σε κάθε έκδοση της υπηρεσίας Google Maps (mobile, desktop), αλλά και στα Google Assistant, Google Earth, Google Search και Android Auto.';
	templateArticle.Author= 'Alexis';
	templateArticle.Date= '16/11/2017';
	templateArticle.SourceTitle= 'Techgear.gr';
	templateArticle.Category= 'Technology';
	templateArticle.Id= 10;
	templateArticle.SentimentGrade= 0;
	templateArticle.comments= [];
	templateArticle.comments.push({Name: "Bill Gates", Content: "Great Article !!!"});
	templateArticle.comments.push({Name: "Elon Musk", Content: "Awesome Article !!!"});
	templateArticle.NegativeWords= [];
	templateArticle.NegativeWords.push("***");
	templateArticle.clickCount= 0;
	templateArticle.reportCount= 0;

	templateArticles.push(templateArticle);
	
	return templateArticles;
}

function loadSourceData () {
	let templateSources= [];

	templateSource= {};
	templateSource.URL= 'www.techblog.gr';
	templateSource.Title= 'Techblog.gr';
	templateSource.Category= 'Technology';

	templateSources.push(templateSource);

	templateSource= {};
	templateSource.URL= 'www.techgear.gr';
	templateSource.Title= 'Techgear.gr';
	templateSource.Category= 'Technology';

	templateSources.push(templateSource);

	templateSource= {};
	templateSource.URL= 'www.engadget.com';
	templateSource.Title= 'Engadget';
	templateSource.Category= 'Technology';

	templateSources.push(templateSource);

	templateSource= {};
	templateSource.URL= 'www.gsmarena.com';
	templateSource.Title= 'GSM-Arena';
	templateSource.Category= 'Technology';

	templateSources.push(templateSource);

	templateSource= {};
	templateSource.URL= 'www.bbc.com';
	templateSource.Title= 'BBC';
	templateSource.Category= 'News';

	templateSources.push(templateSource);

	templateSource= {};
	templateSource.URL= 'www.ant1iwo.com';
	templateSource.Title= 'Ant1iwo';
	templateSource.Category= 'News';

	templateSources.push(templateSource);

	templateSource= {};
	templateSource.URL= 'www.sigmalive.com';
	templateSource.Title= 'Sigmalive';
	templateSource.Category= 'News';

	templateSources.push(templateSource);
	
	return templateSources;
}


About= "Development of a News Reader cross platform mobile App, enhanced with hate\toxic filters.\
\
Synopsis\
-------------------\
The main design pattern of this project is Client-Server model. The client will be the mobile App we develop, which will communicate with the Backend server of our system to retrieve articles. The Backend server will be used as a crawler to collect the articles which will be sent to the users of our mobile App.\
\
How to Get Started\
-------------------\
In order to deploy the project on a live system, you will have to install the Mobile App on a smartphone (Android or iOS) and deploy the backend on Node.js environment.\
(At this point of the development, the Mobile App uses a local database for its' articles and doesn't use the backend server, which is not developed yet.)\
\
For detailed instructions on how to build the Mobile App, follow the instructions in [Readme.md of the Mobile_App direcory](Mobile_App/README.md)\
\
Contributors\
------------\
- [Marios Kelepeshis](https://github.com/mkelepe)\
- [Constantinos Stylianou](https://github.com/cons-stylianou)\
- [Giorgos Hadjidemetriou](https://github.com/ghadji)\
- [Antrea Chrysanthou](https://github.com/antreach)\
- [Ioannis Giagkou](https://github.com/iyiang)\
\
License\
------------\
Copyright 2017 LInC\
\
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the \"Software\"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:\
\
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.\
\
THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\
";
