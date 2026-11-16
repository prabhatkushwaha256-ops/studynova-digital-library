
import React, { useState } from "react";
import StudyNovaAI from "./StudyNovaAI";
import "./StudyNova.css";


// Load real cover images only when a book card approaches the screen.
// Open Library may not have every title; keep a neutral fallback instead of a fake cover.
const coverCache = new Map();

function BookCover({ book }) {
  const frameRef = React.useRef(null);
  const [visible, setVisible] = useState(false);
  const [image, setImage] = useState(book.cover || "");
  const [failed, setFailed] = useState(false);

  React.useEffect(() => {
    if (!frameRef.current) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: "250px" });
    observer.observe(frameRef.current);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (!visible || book.cover) return;
    let cancelled = false;
    const gutenbergId = book.url.match(/gutenberg\.org\/ebooks\/(\d+)/)?.[1];
    if (gutenbergId) {
      setImage(`https://www.gutenberg.org/cache/epub/${gutenbergId}/pg${gutenbergId}.cover.medium.jpg`);
      return;
    }
    if (coverCache.has(book.title)) {
      setImage(coverCache.get(book.title));
      return;
    }
    const controller = new AbortController();
    async function findCover() {
      try {
        const response = await fetch(
          `https://openlibrary.org/search.json?title=${encodeURIComponent(book.title)}&fields=title,cover_i&limit=8`,
          { signal: controller.signal }
        );
        if (!response.ok) throw new Error("Cover lookup failed");
        const data = await response.json();
        const normalize = (value) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
        const exact = data.docs?.find((item) =>
          item.cover_i && normalize(item.title) === normalize(book.title)
        );
        const url = exact ? `https://covers.openlibrary.org/b/id/${exact.cover_i}-L.jpg` : "";
        coverCache.set(book.title, url);
        if (!cancelled) setImage(url);
      } catch (error) {
        if (error.name !== "AbortError") coverCache.set(book.title, "");
      }
    }
    findCover();
    return () => { cancelled = true; controller.abort(); };
  }, [visible, book.title, book.url, book.cover]);

  return (
    <div ref={frameRef} className="real-cover-frame" style={{
      height: 230, width: "100%", padding: 12, boxSizing: "border-box",
      borderRadius: 12, background: "#0b1428", display: "flex",
      alignItems: "center", justifyContent: "center", overflow: "hidden"
    }}>
      {image && !failed ? (
        <img src={image} alt={`${book.title} cover`} loading="lazy"
          onError={() => setFailed(true)}
          style={{ maxHeight: "100%", maxWidth: "100%", width: "auto", height: "auto",
            objectFit: "contain", borderRadius: 4, boxShadow: "0 5px 16px #0006" }} />
      ) : (
        <div style={{ width: 150, minHeight: 190, borderRadius: 5,
          background: "#23334e", borderLeft: "6px solid #172238",
          color: "#e2e8f0", padding: 14, boxSizing: "border-box",
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", textAlign: "center", gap: 14 }}>
          <span style={{ fontSize: 28 }}>📖</span>
          <strong style={{ fontSize: 13, lineHeight: 1.4, overflowWrap: "anywhere" }}>{book.title}</strong>
        </div>
      )}
    </div>
  );
}

function StudyNova() {
  const [search, setSearch] = useState("");
  const [recentBooks, setRecentBooks] = useState(() => {
  try {
    return JSON.parse(
      localStorage.getItem("studynova-recent-books")
    ) || [];
  } catch {
    return [];
  }
});
const handleReadBook = (book) => {
  setRecentBooks((prev) => {
    const updated = [
      book,
      ...prev.filter((item) => item.title !== book.title)
    ].slice(0, 5);

    localStorage.setItem(
      "studynova-recent-books",
      JSON.stringify(updated)
    );

    return updated;
  });
};
const [wishlist, setWishlist] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem("studynova-wishlist")) || [];
  } catch {
    return [];
  }
});
React.useEffect(() => {
  localStorage.setItem(
    "studynova-wishlist",
    JSON.stringify(wishlist)
  );
}, [wishlist]);
  const books = [
    { title: "Think Python", course: "BCA", url: "https://greenteapress.com/wp/think-python-2e/", cover: "https://covers.openlibrary.org/b/isbn/9781491939369-L.jpg" },
    { title: "Think Java", course: "BCA / B.Tech", url: "https://greenteapress.com/wp/think-java-2e/", cover: "https://covers.openlibrary.org/b/isbn/9781492072508-L.jpg" },
    {
  title: "Computer Networking",
  course: "B.Tech",
  url: "https://www.computer-networking.info/",
  cover: "https://covers.openlibrary.org/b/isbn/9780133594140-L.jpg"
},
{
  title: "Financial Accounting",
  course: "B.Com",
  url: "https://openstax.org/details/books/principles-financial-accounting",
cover: "/financial-accounting.png"
},

{
  title: "Introduction to Statistics",
  course: "BCA / B.Com",
  url: "https://openstax.org/details/books/introductory-statistics",
  cover: ""
},
{
  title: "Calculus Volume 1",
  course: "BCA / B.Tech",
  url: "https://openstax.org/details/books/calculus-volume-1",
  cover: ""
},
{
  title: "Introduction to Python Programming",
  course: "BCA / B.Tech",
  url: "https://openstax.org/details/books/introduction-python-programming",
  cover: ""
},
{
  title: "Principles of Economics",
  course: "B.Com",
  url: "https://openstax.org/details/books/principles-economics-3e",
  cover: ""
},

{
  title: "Biology 2e",
  course: "B.Sc",
  url: "https://openstax.org/details/books/biology-2e",
  cover: ""
},
{
  title: "College Physics 2e",
  course: "B.Sc / B.Tech",
  url: "https://openstax.org/details/books/college-physics-2e",
  cover: ""
},
{
  title: "Chemistry 2e",
  course: "B.Sc",
  url: "https://openstax.org/details/books/chemistry-2e",
  cover: ""
},
{
  title: "Introduction to Business",
  course: "B.Com / BBA",
  url: "https://openstax.org/details/books/introduction-business",
  cover: ""
},
{
  title: "Organizational Behavior",
  course: "BBA / MBA",
  url: "https://openstax.org/details/books/organizational-behavior",
  cover: ""
},

{
  title: "Introduction to Sociology 3e",
  course: "BA",
  url: "https://openstax.org/details/books/introduction-sociology-3e",
  cover: ""
},
{
  title: "Psychology 2e",
  course: "BA / B.Sc",
  url: "https://openstax.org/details/books/psychology-2e",
  cover: ""
},
{
  title: "Anatomy and Physiology 2e",
  course: "B.Sc",
  url: "https://openstax.org/details/books/anatomy-and-physiology-2e",
  cover: ""
},
{
  title: "Microbiology",
  course: "B.Sc",
  url: "https://openstax.org/details/books/microbiology",
  cover: ""
},
{
  title: "University Physics Volume 1",
  course: "B.Sc / B.Tech",
  url: "https://openstax.org/details/books/university-physics-volume-1",
  cover: ""
},
{
  title: "College Algebra 2e",
  course: "BCA / B.Sc",
  url: "https://openstax.org/details/books/college-algebra-2e",
  cover: ""
},
{
  title: "Precalculus 2e",
  course: "B.Sc / B.Tech",
  url: "https://openstax.org/details/books/precalculus-2e",
  cover: ""
},
{
  title: "Principles of Management",
  course: "BBA / MBA",
  url: "https://openstax.org/details/books/principles-management",
  cover: ""
},
{
  title: "Business Ethics",
  course: "B.Com / BBA",
  url: "https://openstax.org/details/books/business-ethics",
  cover: ""
},
{
  title: "Entrepreneurship",
  course: "BBA / B.Com",
  url: "https://openstax.org/details/books/entrepreneurship",
  cover: ""
},

{
  title: "American Government 3e",
  course: "BA",
  url: "https://openstax.org/details/books/american-government-3e",
  cover: ""
},
{
  title: "World History Volume 1",
  course: "BA",
  url: "https://openstax.org/details/books/world-history-volume-1",
  cover: ""
},
{
  title: "World History Volume 2",
  course: "BA",
  url: "https://openstax.org/details/books/world-history-volume-2",
  cover: ""
},
{
  title: "Astronomy 2e",
  course: "B.Sc",
  url: "https://openstax.org/details/books/astronomy-2e",
  cover: ""
},
{
  title: "Concepts of Biology",
  course: "B.Sc",
  url: "https://openstax.org/details/books/concepts-biology",
  cover: ""
},
{
  title: "Contemporary Mathematics",
  course: "BCA / B.Sc",
  url: "https://openstax.org/details/books/contemporary-mathematics",
  cover: ""
},
{
  title: "Calculus Volume 2",
  course: "B.Sc / B.Tech",
  url: "https://openstax.org/details/books/calculus-volume-2",
  cover: ""
},
{
  title: "Calculus Volume 3",
  course: "B.Sc / B.Tech",
  url: "https://openstax.org/details/books/calculus-volume-3",
  cover: ""
},
{
  title: "University Physics Volume 2",
  course: "B.Sc / B.Tech",
  url: "https://openstax.org/details/books/university-physics-volume-2",
  cover: ""
},
{
  title: "University Physics Volume 3",
  course: "B.Sc / B.Tech",
  url: "https://openstax.org/details/books/university-physics-volume-3",
  cover: ""
},

{
  title: "Introduction to Political Science",
  course: "BA",
  url: "https://openstax.org/details/books/introduction-political-science",
  cover: ""
},
{
  title: "Introduction to Philosophy",
  course: "BA",
  url: "https://openstax.org/details/books/introduction-philosophy",
  cover: ""
},
{
  title: "Introduction to Anthropology",
  course: "BA / B.Sc",
  url: "https://openstax.org/details/books/introduction-anthropology",
  cover: ""
},
{
  title: "Principles of Macroeconomics 3e",
  course: "BA / B.Com",
  url: "https://openstax.org/details/books/principles-macroeconomics-3e",
  cover: ""
},
{
  title: "Principles of Microeconomics 3e",
  course: "BA / B.Com",
  url: "https://openstax.org/details/books/principles-microeconomics-3e",
  cover: ""
},
{
  title: "Introductory Business Statistics 2e",
  course: "B.Com / BBA",
  url: "https://openstax.org/details/books/introductory-business-statistics-2e",
  cover: ""
},
{
  title: "Writing Guide with Handbook",
  course: "BA",
  url: "https://openstax.org/details/books/writing-guide",
  cover: ""
},
{
  title: "U.S. History",
  course: "BA",
  url: "https://openstax.org/details/books/us-history",
  cover: ""
},
{
  title: "Organic Chemistry",
  course: "B.Sc",
  url: "https://openstax.org/details/books/organic-chemistry",
  cover: ""
},
{
  title: "Introduction to Intellectual Property",
  course: "BA / BBA",
  url: "https://openstax.org/details/books/introduction-intellectual-property",
  cover: ""
},

{
  title: "Introduction to Communication",
  course: "BA / BBA",
  url: "https://openstax.org/subjects",
  cover: ""
},
{
  title: "Workplace Software and Skills",
  course: "BCA / BBA",
  url: "https://openstax.org/subjects",
  cover: ""
},
{
  title: "Business Law I Essentials",
  course: "B.Com / BBA",
  url: "https://openstax.org/details/books/business-law-i-essentials",
  cover: ""
},
{
  title: "Principles of Finance",
  course: "B.Com / BBA",
  url: "https://openstax.org/details/books/principles-finance",
  cover: ""
},
{
  title: "Introduction to Geosciences",
  course: "B.Sc",
  url: "https://openstax.org/subjects",
  cover: ""
},
{
  title: "Physics",
  course: "B.Sc / B.Tech",
  url: "https://openstax.org/subjects",
  cover: ""
},
{
  title: "Statistics",
  course: "BCA / B.Com",
  url: "https://openstax.org/subjects",
  cover: ""
},
{
  title: "Human Biology",
  course: "B.Sc",
  url: "https://openstax.org/subjects",
  cover: ""
},
{
  title: "Economics",
  course: "BA / B.Com",
  url: "https://openstax.org/subjects",
  cover: ""
},
{
  title: "Mathematics",
  course: "BCA / B.Sc",
  url: "https://openstax.org/subjects",
  cover: ""
},

{
  title: "Introduction to Sociology 2e",
  course: "BA",
  url: "https://openstax.org/details/books/introduction-sociology-2e",
  cover: ""
},
{
  title: "Algebra and Trigonometry 2e",
  course: "BCA / B.Sc",
  url: "https://openstax.org/details/books/algebra-and-trigonometry-2e",
  cover: ""
},
{
  title: "Intermediate Algebra 2e",
  course: "BCA / B.Sc",
  url: "https://openstax.org/details/books/intermediate-algebra-2e",
  cover: ""
},
{
  title: "Elementary Algebra 2e",
  course: "BCA / B.Sc",
  url: "https://openstax.org/details/books/elementary-algebra-2e",
  cover: ""
},
{
  title: "Prealgebra 2e",
  course: "BCA / B.Sc",
  url: "https://openstax.org/details/books/prealgebra-2e",
  cover: ""
},
{
  title: "Statistics",
  course: "B.Sc / B.Com",
  url: "https://openstax.org/details/books/introductory-statistics",
  cover: ""
},
{
  title: "Principles of Accounting Volume 1",
  course: "B.Com",
  url: "https://openstax.org/details/books/principles-financial-accounting",
  cover: ""
},
{
  title: "Principles of Accounting Volume 2",
  course: "B.Com",
  url: "https://openstax.org/details/books/principles-managerial-accounting",
  cover: ""
},
{
  title: "Introduction to Sociology 3e",
  course: "BA / BSW",
  url: "https://openstax.org/details/books/introduction-sociology-3e",
  cover: ""
},
{
  title: "Life, Liberty, and the Pursuit of Happiness",
  course: "BA",
  url: "https://openstax.org/details/books/life-liberty-and-pursuit-happiness",
  cover: ""
},

{
  title: "Computer Science",
  course: "BCA / B.Tech",
  url: "https://open.umn.edu/opentextbooks/subjects/computer-science-information-systems",
  cover: ""
},
{
  title: "Data Structures",
  course: "BCA / B.Tech",
  url: "https://open.umn.edu/opentextbooks/subjects/computer-science-information-systems",
  cover: ""
},
{
  title: "Database Management Systems",
  course: "BCA / B.Tech",
  url: "https://open.umn.edu/opentextbooks/subjects/computer-science-information-systems",
  cover: ""
},
{
  title: "Operating Systems",
  course: "BCA / B.Tech",
  url: "https://open.umn.edu/opentextbooks/subjects/computer-science-information-systems",
  cover: ""
},
{
  title: "Software Engineering",
  course: "BCA / B.Tech",
  url: "https://open.umn.edu/opentextbooks/subjects/computer-science-information-systems",
  cover: ""
},
{
  title: "Marketing",
  course: "BBA / B.Com",
  url: "https://open.umn.edu/opentextbooks/subjects/business",
  cover: ""
},
{
  title: "Human Resource Management",
  course: "BBA / MBA",
  url: "https://open.umn.edu/opentextbooks/subjects/business",
  cover: ""
},
{
  title: "Business Communication",
  course: "BBA / B.Com",
  url: "https://open.umn.edu/opentextbooks/subjects/business",
  cover: ""
},
{
  title: "Environmental Science",
  course: "B.Sc / BA",
  url: "https://openstax.org/details/books/environmental-science",
  cover: ""
},
{
  title: "Nutrition",
  course: "B.Sc",
  url: "https://open.umn.edu/opentextbooks/subjects/health-medicine",
  cover: ""
},

{
  title: "Introduction to Computer Science",
  course: "BCA / B.Tech",
  url: "https://open.umn.edu/opentextbooks/subjects/computer-science-information-systems",
  cover: ""
},
{
  title: "Web Development",
  course: "BCA / B.Tech",
  url: "https://open.umn.edu/opentextbooks/subjects/computer-science-information-systems",
  cover: ""
},
{
  title: "Cybersecurity",
  course: "BCA / B.Tech",
  url: "https://open.umn.edu/opentextbooks/subjects/computer-science-information-systems",
  cover: ""
},
{
  title: "Artificial Intelligence",
  course: "BCA / B.Tech",
  url: "https://open.umn.edu/opentextbooks/subjects/computer-science-information-systems",
  cover: ""
},
{
  title: "Financial Management",
  course: "B.Com / MBA",
  url: "https://open.umn.edu/opentextbooks/subjects/business",
  cover: ""
},
{
  title: "International Business",
  course: "BBA / MBA",
  url: "https://open.umn.edu/opentextbooks/subjects/business",
  cover: ""
},
{
  title: "Public Speaking",
  course: "BA / BBA",
  url: "https://openstax.org/details/books/stand-up-speak-out",
  cover: ""
},
{
  title: "Introduction to Ethics",
  course: "BA",
  url: "https://open.umn.edu/opentextbooks/subjects/philosophy",
  cover: ""
},
{
  title: "Environmental Biology",
  course: "B.Sc",
  url: "https://open.umn.edu/opentextbooks/subjects/biology",
  cover: ""
},
{
  title: "Health and Wellness",
  course: "B.Sc",
  url: "https://open.umn.edu/opentextbooks/subjects/health-medicine",
  cover: ""
},

{
  title: "Think Python 2e",
  course: "BCA / B.Tech",
  url: "https://greenteapress.com/wp/think-python-2e/",
  cover: ""
},
{
  title: "Think Java 2e",
  course: "BCA / B.Tech",
  url: "https://greenteapress.com/wp/think-java-2e/",
  cover: ""
},
{
  title: "Automate the Boring Stuff with Python",
  course: "BCA / B.Tech",
  url: "https://automatetheboringstuff.com/",
  cover: ""
},
{
  title: "Python for Everybody",
  course: "BCA / B.Tech",
  url: "https://www.py4e.com/book",
  cover: ""
},
{
  title: "Eloquent JavaScript",
  course: "BCA / B.Tech",
  url: "https://eloquentjavascript.net/",
  cover: ""
},
{
  title: "You Don't Know JS Yet",
  course: "BCA / B.Tech",
  url: "https://github.com/getify/You-Dont-Know-JS",
  cover: ""
},
{
  title: "JavaScript for Impatient Programmers",
  course: "BCA / B.Tech",
  url: "https://exploringjs.com/impatient-js/",
  cover: ""
},
{
  title: "Exploring TypeScript",
  course: "BCA / B.Tech",
  url: "https://exploringjs.com/tackling-ts/",
  cover: ""
},
{
  title: "The Rust Programming Language",
  course: "BCA / B.Tech",
  url: "https://doc.rust-lang.org/book/",
  cover: ""
},
{
  title: "Rust by Example",
  course: "BCA / B.Tech",
  url: "https://doc.rust-lang.org/rust-by-example/",
  cover: ""
},
{
  title: "The Go Programming Language",
  course: "BCA / B.Tech",
  url: "https://go.dev/doc/",
  cover: ""
},
{
  title: "Learn You a Haskell",
  course: "BCA / B.Tech",
  url: "https://learnyouahaskell.com/",
  cover: ""
},
{
  title: "Structure and Interpretation of Computer Programs",
  course: "BCA / B.Tech",
  url: "https://sicp.sourceacademy.org/",
  cover: ""
},
{
  title: "How to Design Programs",
  course: "BCA / B.Tech",
  url: "https://htdp.org/",
  cover: ""
},
{
  title: "Composing Programs",
  course: "BCA / B.Tech",
  url: "https://www.composingprograms.com/",
  cover: ""
},
{
  title: "Dive Into Deep Learning",
  course: "BCA / B.Tech",
  url: "https://d2l.ai/",
  cover: ""
},
{
  title: "Understanding Deep Learning",
  course: "BCA / B.Tech",
  url: "https://udlbook.github.io/udlbook/",
  cover: ""
},
{
  title: "Neural Networks and Deep Learning",
  course: "BCA / B.Tech",
  url: "http://neuralnetworksanddeeplearning.com/",
  cover: ""
},
{
  title: "The Elements of Statistical Learning",
  course: "BCA / B.Sc",
  url: "https://hastie.su.domains/ElemStatLearn/",
  cover: ""
},
{
  title: "An Introduction to Statistical Learning",
  course: "BCA / B.Sc",
  url: "https://www.statlearning.com/",
  cover: ""
},
{
  title: "Mathematics for Machine Learning",
  course: "BCA / B.Tech",
  url: "https://mml-book.github.io/",
  cover: ""
},
{
  title: "Probabilistic Machine Learning",
  course: "BCA / B.Tech",
  url: "https://probml.github.io/pml-book/",
  cover: ""
},
{
  title: "Algorithms",
  course: "BCA / B.Tech",
  url: "https://jeffe.cs.illinois.edu/teaching/algorithms/",
  cover: ""
},
{
  title: "Open Data Structures",
  course: "BCA / B.Tech",
  url: "https://opendatastructures.org/",
  cover: ""
},
{
  title: "Algorithms for Competitive Programming",
  course: "BCA / B.Tech",
  url: "https://cp-algorithms.com/",
  cover: ""
},
{
  title: "Operating Systems: Three Easy Pieces",
  course: "BCA / B.Tech",
  url: "https://pages.cs.wisc.edu/~remzi/OSTEP/",
  cover: ""
},
{
  title: "Computer Systems: A Programmer's Perspective Notes",
  course: "BCA / B.Tech",
  url: "https://csapp.cs.cmu.edu/",
  cover: ""
},
{
  title: "Database Design",
  course: "BCA / B.Tech",
  url: "https://opentextbc.ca/dbdesign01/",
  cover: ""
},
{
  title: "SQL Tutorial",
  course: "BCA / B.Tech",
  url: "https://www.sqltutorial.org/",
  cover: ""
},
{
  title: "Git Pro Book",
  course: "BCA / B.Tech",
  url: "https://git-scm.com/book/en/v2",
  cover: ""
},
{
  title: "Linux Command Line",
  course: "BCA / B.Tech",
  url: "https://linuxcommand.org/tlcl.php",
  cover: ""
},
{
  title: "Introduction to Linux",
  course: "BCA / B.Tech",
  url: "https://tldp.org/LDP/intro-linux/html/",
  cover: ""
},
{
  title: "The Missing Semester",
  course: "BCA / B.Tech",
  url: "https://missing.csail.mit.edu/",
  cover: ""
},
{
  title: "HTML and CSS",
  course: "BCA / B.Tech",
  url: "https://developer.mozilla.org/en-US/docs/Learn_web_development",
  cover: ""
},
{
  title: "JavaScript Guide",
  course: "BCA / B.Tech",
  url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
  cover: ""
},
{
  title: "React Documentation",
  course: "BCA / B.Tech",
  url: "https://react.dev/learn",
  cover: ""
},
{
  title: "Vue.js Guide",
  course: "BCA / B.Tech",
  url: "https://vuejs.org/guide/introduction.html",
  cover: ""
},
{
  title: "Django Documentation",
  course: "BCA / B.Tech",
  url: "https://docs.djangoproject.com/en/stable/intro/",
  cover: ""
},
{
  title: "Flask Documentation",
  course: "BCA / B.Tech",
  url: "https://flask.palletsprojects.com/en/stable/",
  cover: ""
},
{
  title: "FastAPI Tutorial",
  course: "BCA / B.Tech",
  url: "https://fastapi.tiangolo.com/tutorial/",
  cover: ""
},
{
  title: "OpenIntro Statistics",
  course: "B.Com / B.Sc",
  url: "https://www.openintro.org/book/os/",
  cover: ""
},
{
  title: "Introduction to Econometrics",
  course: "BA / B.Com",
  url: "https://www.econometrics-with-r.org/",
  cover: ""
},
{
  title: "Principles of Marketing",
  course: "BBA / B.Com",
  url: "https://openstax.org/details/books/principles-marketing",
  cover: ""
},
{
  title: "Managerial Accounting",
  course: "B.Com / BBA",
  url: "https://openstax.org/details/books/principles-managerial-accounting",
  cover: ""
},
{
  title: "Business Statistics",
  course: "B.Com / BBA",
  url: "https://openstax.org/details/books/introductory-business-statistics-2e",
  cover: ""
},
{
  title: "Introduction to Psychology",
  course: "BA / B.Sc",
  url: "https://openstax.org/details/books/psychology-2e",
  cover: ""
},
{
  title: "Human Anatomy",
  course: "B.Sc",
  url: "https://openstax.org/details/books/anatomy-and-physiology-2e",
  cover: ""
},
{
  title: "Physics for Scientists",
  course: "B.Sc / B.Tech",
  url: "https://openstax.org/details/books/university-physics-volume-1",
  cover: ""
},
{
  title: "Introduction to Astronomy",
  course: "B.Sc",
  url: "https://openstax.org/details/books/astronomy-2e",
  cover: ""
},
{
  title: "Introduction to Environmental Science",
  course: "B.Sc / BA",
  url: "https://openstax.org/details/books/environmental-science",
  cover: ""
},


    // 100 additional free reading resources (some are manuals or collections).
    { title: "Pride and Prejudice", course: "BA", url: "https://www.gutenberg.org/ebooks/1342", cover: "" },
    { title: "Frankenstein", course: "BA", url: "https://www.gutenberg.org/ebooks/84", cover: "" },
    { title: "The Adventures of Sherlock Holmes", course: "BA", url: "https://www.gutenberg.org/ebooks/1661", cover: "" },
    { title: "Alice’s Adventures in Wonderland", course: "BA", url: "https://www.gutenberg.org/ebooks/11", cover: "" },
    { title: "Moby Dick", course: "BA", url: "https://www.gutenberg.org/ebooks/2701", cover: "" },
    { title: "A Tale of Two Cities", course: "BA", url: "https://www.gutenberg.org/ebooks/98", cover: "" },
    { title: "Dracula", course: "BA", url: "https://www.gutenberg.org/ebooks/345", cover: "" },
    { title: "The Picture of Dorian Gray", course: "BA", url: "https://www.gutenberg.org/ebooks/174", cover: "" },
    { title: "War and Peace", course: "BA", url: "https://www.gutenberg.org/ebooks/2600", cover: "" },
    { title: "Great Expectations", course: "BA", url: "https://www.gutenberg.org/ebooks/1400", cover: "" },
    { title: "Adventures of Huckleberry Finn", course: "BA", url: "https://www.gutenberg.org/ebooks/76", cover: "" },
    { title: "A Modest Proposal", course: "BA", url: "https://www.gutenberg.org/ebooks/1080", cover: "" },
    { title: "Ulysses", course: "BA", url: "https://www.gutenberg.org/ebooks/4300", cover: "" },
    { title: "The Metamorphosis", course: "BA", url: "https://www.gutenberg.org/ebooks/5200", cover: "" },
    { title: "The Great Gatsby", course: "BA", url: "https://www.gutenberg.org/ebooks/64317", cover: "" },
    { title: "The Yellow Wallpaper", course: "BA", url: "https://www.gutenberg.org/ebooks/1952", cover: "" },
    { title: "A Christmas Carol", course: "BA", url: "https://www.gutenberg.org/ebooks/46", cover: "" },
    { title: "Crime and Punishment", course: "BA", url: "https://www.gutenberg.org/ebooks/2554", cover: "" },
    { title: "Jane Eyre", course: "BA", url: "https://www.gutenberg.org/ebooks/1260", cover: "" },
    { title: "Wuthering Heights", course: "BA", url: "https://www.gutenberg.org/ebooks/768", cover: "" },
    { title: "The Importance of Being Earnest", course: "BA", url: "https://www.gutenberg.org/ebooks/844", cover: "" },
    { title: "Little Women", course: "BA", url: "https://www.gutenberg.org/ebooks/514", cover: "" },
    { title: "Emma", course: "BA", url: "https://www.gutenberg.org/ebooks/158", cover: "" },
    { title: "Sense and Sensibility", course: "BA", url: "https://www.gutenberg.org/ebooks/161", cover: "" },
    { title: "Northanger Abbey", course: "BA", url: "https://www.gutenberg.org/ebooks/121", cover: "" },
    { title: "Persuasion", course: "BA", url: "https://www.gutenberg.org/ebooks/105", cover: "" },
    { title: "Mansfield Park", course: "BA", url: "https://www.gutenberg.org/ebooks/141", cover: "" },
    { title: "Oliver Twist", course: "BA", url: "https://www.gutenberg.org/ebooks/730", cover: "" },
    { title: "Don Quixote", course: "BA", url: "https://www.gutenberg.org/ebooks/996", cover: "" },
    { title: "The Republic by Plato", course: "BA", url: "https://www.gutenberg.org/ebooks/1497", cover: "" },
    { title: "The Prince by Machiavelli", course: "BA", url: "https://www.gutenberg.org/ebooks/1232", cover: "" },
    { title: "The Time Machine", course: "BA", url: "https://www.gutenberg.org/ebooks/35", cover: "" },
    { title: "The War of the Worlds", course: "BA", url: "https://www.gutenberg.org/ebooks/36", cover: "" },
    { title: "The Wonderful Wizard of Oz", course: "BA", url: "https://www.gutenberg.org/ebooks/55", cover: "" },
    { title: "The Secret Garden", course: "BA", url: "https://www.gutenberg.org/ebooks/17396", cover: "" },
    { title: "The Call of the Wild", course: "BA", url: "https://www.gutenberg.org/ebooks/215", cover: "" },
    { title: "The Jungle Book", course: "BA", url: "https://www.gutenberg.org/ebooks/236", cover: "" },
    { title: "The Adventures of Tom Sawyer", course: "BA", url: "https://www.gutenberg.org/ebooks/74", cover: "" },
    { title: "The Count of Monte Cristo", course: "BA", url: "https://www.gutenberg.org/ebooks/1184", cover: "" },
    { title: "The Iliad", course: "BA", url: "https://www.gutenberg.org/ebooks/6130", cover: "" },
    { title: "The C Programming Language — GNU C Manual", course: "BCA / B.Tech", url: "https://www.gnu.org/software/gnu-c-manual/gnu-c-manual.html", cover: "" },
    { title: "Beej’s Guide to C Programming", course: "BCA / B.Tech", url: "https://beej.us/guide/bgc/", cover: "" },
    { title: "Beej’s Guide to Network Programming", course: "BCA / B.Tech", url: "https://beej.us/guide/bgnet/", cover: "" },
    { title: "Beej’s Guide to Unix IPC", course: "BCA / B.Tech", url: "https://beej.us/guide/bgipc/", cover: "" },
    { title: "The Python Tutorial", course: "BCA / B.Tech", url: "https://docs.python.org/3/tutorial/", cover: "" },
    { title: "Python Data Science Handbook", course: "BCA / B.Tech", url: "https://jakevdp.github.io/PythonDataScienceHandbook/", cover: "" },
    { title: "Think Stats, 2nd Edition", course: "BCA / B.Sc", url: "https://greenteapress.com/wp/think-stats-2e/", cover: "" },
    { title: "Think Bayes, 2nd Edition", course: "BCA / B.Sc", url: "https://greenteapress.com/wp/think-bayes/", cover: "" },
    { title: "Think Complexity, 2nd Edition", course: "BCA / B.Tech", url: "https://greenteapress.com/wp/think-complexity-2e/", cover: "" },
    { title: "Think DSP", course: "BCA / B.Tech", url: "https://greenteapress.com/wp/think-dsp/", cover: "" },
    { title: "Think OS", course: "BCA / B.Tech", url: "https://greenteapress.com/wp/think-os/", cover: "" },
    { title: "Think Data Structures", course: "BCA / B.Tech", url: "https://greenteapress.com/wp/think-data-structures/", cover: "" },
    { title: "Think Perl 6", course: "BCA / B.Tech", url: "https://greenteapress.com/wp/think-perl-6/", cover: "" },
    { title: "Think OCaml", course: "BCA / B.Tech", url: "https://greenteapress.com/wp/think-ocaml/", cover: "" },
    { title: "A Byte of Python", course: "BCA / B.Tech", url: "https://python.swaroopch.com/", cover: "" },
    { title: "Full Stack Open", course: "BCA / B.Tech", url: "https://fullstackopen.com/en/", cover: "" },
    { title: "The Odin Project Foundations", course: "BCA / B.Tech", url: "https://www.theodinproject.com/paths/foundations/courses/foundations", cover: "" },
    { title: "Learn Git Branching", course: "BCA / B.Tech", url: "https://learngitbranching.js.org/", cover: "" },
    { title: "The Linux Documentation Project — Bash Guide", course: "BCA / B.Tech", url: "https://tldp.org/LDP/abs/html/", cover: "" },
    { title: "Bash Guide for Beginners", course: "BCA / B.Tech", url: "https://tldp.org/LDP/Bash-Beginners-Guide/html/", cover: "" },
    { title: "The GNU Make Manual", course: "BCA / B.Tech", url: "https://www.gnu.org/software/make/manual/", cover: "" },
    { title: "GNU Emacs Manual", course: "BCA / B.Tech", url: "https://www.gnu.org/software/emacs/manual/html_node/emacs/", cover: "" },
    { title: "GNU Bash Manual", course: "BCA / B.Tech", url: "https://www.gnu.org/software/bash/manual/", cover: "" },
    { title: "PostgreSQL Tutorial", course: "BCA / B.Tech", url: "https://www.postgresql.org/docs/current/tutorial.html", cover: "" },
    { title: "SQLite Documentation", course: "BCA / B.Tech", url: "https://www.sqlite.org/docs.html", cover: "" },
    { title: "The TypeScript Handbook", course: "BCA / B.Tech", url: "https://www.typescriptlang.org/docs/handbook/intro.html", cover: "" },
    { title: "The Kotlin Language Guide", course: "BCA / B.Tech", url: "https://kotlinlang.org/docs/home.html", cover: "" },
    { title: "The Swift Programming Language", course: "BCA / B.Tech", url: "https://docs.swift.org/swift-book/documentation/the-swift-programming-language/", cover: "" },
    { title: "The Elixir Getting Started Guide", course: "BCA / B.Tech", url: "https://elixir-lang.org/getting-started/introduction.html", cover: "" },
    { title: "The Julia Manual", course: "BCA / B.Tech", url: "https://docs.julialang.org/en/v1/manual/getting-started/", cover: "" },
    { title: "R for Data Science, 2e", course: "BCA / B.Sc", url: "https://r4ds.hadley.nz/", cover: "" },
    { title: "Advanced R, 2e", course: "BCA / B.Sc", url: "https://adv-r.hadley.nz/", cover: "" },
    { title: "R Packages, 2e", course: "BCA / B.Sc", url: "https://r-pkgs.org/", cover: "" },
    { title: "Hands-On Programming with R", course: "BCA / B.Sc", url: "https://rstudio-education.github.io/hopr/", cover: "" },
    { title: "Data Science at the Command Line", course: "BCA / B.Sc", url: "https://datascienceatthecommandline.com/", cover: "" },
    { title: "The Tidyverse Style Guide", course: "BCA / B.Sc", url: "https://style.tidyverse.org/", cover: "" },
    { title: "Forecasting: Principles and Practice, 3e", course: "B.Com / B.Sc", url: "https://otexts.com/fpp3/", cover: "" },
    { title: "Introduction to Modern Statistics", course: "B.Com / B.Sc", url: "https://openintro-ims.netlify.app/", cover: "" },
    { title: "OpenIntro Statistics Labs", course: "B.Com / B.Sc", url: "https://www.openintro.org/book/os/", cover: "" },
    { title: "Online Statistics Education", course: "B.Com / B.Sc", url: "https://onlinestatbook.com/2/", cover: "" },
    { title: "Mathematics for Computer Science", course: "BCA / B.Tech", url: "https://courses.csail.mit.edu/6.042/spring18/mcs.pdf", cover: "" },
    { title: "Linear Algebra by Jim Hefferon", course: "B.Sc / B.Tech", url: "https://hefferon.net/linearalgebra/", cover: "" },
    { title: "Linear Algebra by David Cherney", course: "B.Sc / B.Tech", url: "https://www.math.ucdavis.edu/~linear/", cover: "" },
    { title: "Active Calculus", course: "B.Sc / B.Tech", url: "https://activecalculus.org/", cover: "" },
    { title: "Apex Calculus", course: "B.Sc / B.Tech", url: "https://www.apexcalculus.com/", cover: "" },
    { title: "Elementary Differential Equations — Trench", course: "B.Sc / B.Tech", url: "https://digitalcommons.trinity.edu/mono/8/", cover: "" },
    { title: "Open Logic Project", course: "BA / B.Sc", url: "https://openlogicproject.org/", cover: "" },
    { title: "forall x: An Introduction to Formal Logic", course: "BA / B.Sc", url: "https://forallx.openlogicproject.org/", cover: "" },
    { title: "Book of Proof", course: "B.Sc", url: "https://www.people.vcu.edu/~rhammack/BookOfProof/", cover: "" },
    { title: "Discrete Mathematics: An Open Introduction", course: "BCA / B.Sc", url: "https://discrete.openmathbooks.org/dmoi3.html", cover: "" },
    { title: "Introduction to Probability — Grinstead and Snell", course: "B.Sc / B.Com", url: "https://math.dartmouth.edu/~prob/prob/prob.pdf", cover: "" },
    { title: "Open Textbook of Biology — LibreTexts", course: "B.Sc", url: "https://bio.libretexts.org/Bookshelves", cover: "" },
    { title: "Chemistry LibreTexts Bookshelves", course: "B.Sc", url: "https://chem.libretexts.org/Bookshelves", cover: "" },
    { title: "Physics LibreTexts Bookshelves", course: "B.Sc / B.Tech", url: "https://phys.libretexts.org/Bookshelves", cover: "" },
    { title: "Mathematics LibreTexts Bookshelves", course: "B.Sc / B.Tech", url: "https://math.libretexts.org/Bookshelves", cover: "" },
    { title: "Business LibreTexts Bookshelves", course: "B.Com / BBA", url: "https://biz.libretexts.org/Bookshelves", cover: "" },
    { title: "Social Sciences LibreTexts Bookshelves", course: "BA", url: "https://socialsci.libretexts.org/Bookshelves", cover: "" },
    { title: "Humanities LibreTexts Bookshelves", course: "BA", url: "https://human.libretexts.org/Bookshelves", cover: "" },
    { title: "Engineering LibreTexts Bookshelves", course: "B.Tech", url: "https://eng.libretexts.org/Bookshelves", cover: "" },
    { title: "Medicine LibreTexts Bookshelves", course: "B.Sc", url: "https://med.libretexts.org/Bookshelves", cover: "" },

  ];
const habitBooks = [
  
{ title: "As a Man Thinketh", course: "Motivation", url: "https://www.gutenberg.org/ebooks/4507", cover: "" },
{ title: "The Power of Concentration", course: "Motivation", url: "https://www.gutenberg.org/ebooks/1570", cover: "" },
{ title: "The Science of Getting Rich", course: "Motivation", url: "https://www.gutenberg.org/ebooks/59844", cover: "" },
{ title: "The Art of Public Speaking", course: "Motivation", url: "https://www.gutenberg.org/ebooks/16317", cover: "" },
{ title: "Self-Reliance", course: "Motivation", url: "https://www.gutenberg.org/ebooks/16643", cover: "" },
{ title: "The Prophet", course: "Motivation", url: "https://www.gutenberg.org/ebooks/58585", cover: "" },
{ title: "Acres of Diamonds", course: "Motivation", url: "https://www.gutenberg.org/ebooks/368", cover: "" },
{ title: "The Game of Life and How to Play It", course: "Motivation", url: "https://www.gutenberg.org/", cover: "" },
{ title: "The Master Key System", course: "Motivation", url: "https://www.gutenberg.org/", cover: "" },
{ title: "The Kybalion", course: "Motivation", url: "https://www.gutenberg.org/", cover: "" },
{ title: "How to Live on 24 Hours a Day", course: "Motivation", url: "https://www.gutenberg.org/ebooks/2274", cover: "" },
{ title: "The Way to Wealth", course: "Motivation", url: "https://www.gutenberg.org/", cover: "" },
{ title: "The Autobiography of Benjamin Franklin", course: "Motivation", url: "https://www.gutenberg.org/ebooks/20203", cover: "" },
{ title: "The Art of Money Getting", course: "Motivation", url: "https://www.gutenberg.org/ebooks/8581", cover: "" },
{ title: "The Book of Five Rings", course: "Motivation", url: "https://www.gutenberg.org/", cover: "" },
{ title: "Meditations", course: "Motivation", url: "https://www.gutenberg.org/ebooks/2680", cover: "" },
{ title: "The Enchiridion", course: "Motivation", url: "https://www.gutenberg.org/", cover: "" },
{ title: "The Practice of the Presence of God", course: "Motivation", url: "https://www.gutenberg.org/", cover: "" },
{ title: "The Strangest Secret", course: "Motivation", url: "https://www.google.com/search?q=The+Strangest+Secret+Earl+Nightingale", cover: "" },
{ title: "The Magic of Thinking Big", course: "Motivation", url: "https://www.google.com/search?q=The+Magic+of+Thinking+Big+David+Schwartz", cover: "" },
{ title: "Atomic Habits", course: "Motivation", url: "https://jamesclear.com/atomic-habits", cover: "" },
{ title: "The 7 Habits of Highly Effective People", course: "Motivation", url: "https://www.franklincovey.com/the-7-habits/", cover: "" },
{ title: "Think and Grow Rich", course: "Motivation", url: "https://www.google.com/search?q=Think+and+Grow+Rich+Napoleon+Hill", cover: "" },
{ title: "How to Win Friends and Influence People", course: "Motivation", url: "https://www.google.com/search?q=How+to+Win+Friends+and+Influence+People", cover: "" },
{ title: "The Power of Positive Thinking", course: "Motivation", url: "https://www.google.com/search?q=The+Power+of+Positive+Thinking", cover: "" },
{ title: "The Power of Now", course: "Motivation", url: "https://www.google.com/search?q=The+Power+of+Now+Eckhart+Tolle", cover: "" },
{ title: "The Alchemist", course: "Motivation", url: "https://www.google.com/search?q=The+Alchemist+Paulo+Coelho", cover: "" },
{ title: "Man's Search for Meaning", course: "Motivation", url: "https://www.google.com/search?q=Mans+Search+for+Meaning+Viktor+Frankl", cover: "" },
{ title: "Deep Work", course: "Motivation", url: "https://calnewport.com/writing/", cover: "" },
{ title: "The 5 AM Club", course: "Motivation", url: "https://www.google.com/search?q=The+5+AM+Club+Robin+Sharma", cover: "" },
{ title: "The Monk Who Sold His Ferrari", course: "Motivation", url: "https://www.google.com/search?q=The+Monk+Who+Sold+His+Ferrari", cover: "" },
{ title: "The Psychology of Money", course: "Motivation", url: "https://www.google.com/search?q=The+Psychology+of+Money+Morgan+Housel", cover: "" },
{ title: "Mindset", course: "Motivation", url: "https://www.google.com/search?q=Mindset+Carol+Dweck", cover: "" },
{ title: "Grit", course: "Motivation", url: "https://angeladuckworth.com/grit-book/", cover: "" },
{ title: "Can't Hurt Me", course: "Motivation", url: "https://davidgoggins.com/book/", cover: "" },
{ title: "The Mountain Is You", course: "Motivation", url: "https://www.google.com/search?q=The+Mountain+Is+You+Brianna+Wiest", cover: "" },
{ title: "The Subtle Art of Not Giving a F*ck", course: "Motivation", url: "https://markmanson.net/books/subtle-art", cover: "" },
{ title: "The Four Agreements", course: "Motivation", url: "https://www.google.com/search?q=The+Four+Agreements", cover: "" },
{ title: "The Courage to Be Disliked", course: "Motivation", url: "https://www.google.com/search?q=The+Courage+to+Be+Disliked", cover: "" },
{ title: "Ikigai", course: "Motivation", url: "https://www.google.com/search?q=Ikigai+Hector+Garcia", cover: "" },
{ title: "Make Your Bed", course: "Motivation", url: "https://www.google.com/search?q=Make+Your+Bed+McRaven", cover: "" },
{ title: "The Compound Effect", course: "Motivation", url: "https://www.google.com/search?q=The+Compound+Effect+Darren+Hardy", cover: "" },
{ title: "Eat That Frog!", course: "Motivation", url: "https://www.google.com/search?q=Eat+That+Frog+Brian+Tracy", cover: "" },
{ title: "The One Thing", course: "Motivation", url: "https://the1thing.com/book/", cover: "" },
{ title: "The War of Art", course: "Motivation", url: "https://stevenpressfield.com/books/the-war-of-art/", cover: "" },
{ title: "The Obstacle Is the Way", course: "Motivation", url: "https://www.google.com/search?q=The+Obstacle+Is+the+Way+Ryan+Holiday", cover: "" },
{ title: "Ego Is the Enemy", course: "Motivation", url: "https://www.google.com/search?q=Ego+Is+the+Enemy+Ryan+Holiday", cover: "" },
{ title: "The Daily Stoic", course: "Motivation", url: "https://dailystoic.com/book/", cover: "" },
{ title: "The Richest Man in Babylon", course: "Motivation", url: "https://www.google.com/search?q=The+Richest+Man+in+Babylon", cover: "" },
{ title: "You Can Win", course: "Motivation", url: "https://www.google.com/search?q=You+Can+Win+Shiv+Khera", cover: "" }

];
const courses = ["BCA", "B.Tech", "B.Com", "BBA", "BA", "B.Sc"];

  const filteredBooks = [...books, ...habitBooks].filter((book) =>
    `${book.title} ${book.course}`
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );

  return (
    <div className="studynova-home">
        <aside className="studynova-sidebar">
  <h2>📚 StudyNova</h2>
  <a href="#home">🏠 Home</a>
  <a href="#books">📖 Books</a>
  
  <a href="#continue-reading">📖 Continue Reading</a>
  <a href="#courses">🎓 Courses</a>
  <a href="#about">ℹ️ About</a>
</aside>
      
        <nav className="studynova-navbar">
  <div className="navbar-logo">📖 StudyNova</div>

  <div className="navbar-links">
    <a href="#home">Home</a>
    <a href="#books">Books</a>
    <a href="#courses">Courses</a>
    <a href="#about">About</a>
  </div>

  <a href="mailto:contact@studynova.com" className="navbar-contact">
    ✉ Contact
  </a>
</nav>

<div id="home" className="studynova-hero">
        <img src="/founder.png" alt="StudyNova Founder" className="founder-photo" />
        <h1>📚 StudyNova Digital Library</h1>
        <p>✨ A Brighter Way to Learn</p>
        <p>Free books for every student. No login required!</p>
      </div>

      <input
        type="text"
        placeholder="🔍 Search books or courses..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ padding: "12px", width: "90%", maxWidth: "450px" }}
      />

{search !== "" && (
  <button
    onClick={() => setSearch("")}
    style={{ padding: "10px 16px", margin: "10px", cursor: "pointer" }}
  >
    ❌ Clear Search
  </button>
)}



<p style={{
  textAlign: "center",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "20px 0",
  color: "#a5b4fc"
}}>
  📚 {books.length +habitBooks.length} Books Available in StudyNova
</p>

<p style={{
  textAlign: "center",
  fontSize: "16px",
  fontWeight: "bold",
  color: "#a5b4fc"
}}>
  🎓 {courses.length} Courses Available
</p>


<div id="courses" className="course-categories">
  <button onClick={() => {
    setSearch("");
    document.getElementById("books")?.scrollIntoView({ behavior: "smooth" });
  }}>📚 All Books</button>
  <button onClick={() => {
  document.getElementById("motivation")?.scrollIntoView({
    behavior: "smooth"
  });
}}>🔥 Motivation</button>

  <button onClick={() => {
    setSearch("");
    document.getElementById("books")?.scrollIntoView({ behavior: "smooth" });
  }}>💻 BCA</button>

  <button onClick={() => {
    setSearch("");
    document.getElementById("btech")?.scrollIntoView({ behavior: "smooth" });
  }}>⚙️ B.Tech</button>

  <button onClick={() => {
    setSearch("");
    document.getElementById("bcom")?.scrollIntoView({ behavior: "smooth" });
  }}>📊 B.Com</button>

  <button onClick={() => {
    setSearch("");
    document.getElementById("bba")?.scrollIntoView({ behavior: "smooth" });
  }}>💼 BBA</button>

  <button onClick={() => {
    setSearch("");
    document.getElementById("ba")?.scrollIntoView({ behavior: "smooth" });
  }}>🎓 BA</button>

  <button onClick={() => {
    setSearch("");
    document.getElementById("bsc")?.scrollIntoView({ behavior: "smooth" });
  }}>🔬 B.Sc</button>
</div>


{search.trim() !== "" && filteredBooks.length === 0 && (
  <p style={{ textAlign: "center", padding: "20px" }}>
    📚 No books found. Try another search!
  </p>
)}

{search.trim() !== "" && filteredBooks.length > 0 && (
  <p style={{ textAlign: "center", fontWeight: "bold" }}>
    🔍 {filteredBooks.length} books found
  </p>
)}
<h2 id="continue-reading">📖 Continue Reading</h2>
<button
  onClick={() => {
    setRecentBooks([]);
    localStorage.removeItem("studynova-recent-books");
  }}
>
  🗑️ Clear History
</button>
<div className="books-grid">
  {recentBooks.length === 0 ? (
    <p>Abhi koi book open nahi ki hai.</p>
  ) : (
    recentBooks.map((book, index) => (
      <div key={`recent-${index}`} className="book-card">
        <BookCover book={book} />
        <h3>{book.title}</h3>
        <p>Course: {book.course}</p>
        <a
          href={book.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleReadBook(book)}
        >
          📖 Continue Reading
        </a>
      </div>
    ))
  )}
</div>
<h2 id="wishlist">❤️ My Wishlist ({wishlist.length})</h2>

<div className="books-grid">
  {[...books, ...habitBooks]
    .filter((book) => wishlist.includes(book.title))
    .map((book, index) => (
      <div key={`wishlist-${index}`} className="book-card">
        <BookCover book={book} />
        <h3>{book.title}</h3>
        <p>Category: {book.course}</p>
        <a
  href={book.url}
  target="_blank"
  rel="noopener noreferrer"
  onClick={() => handleReadBook(book)}
>
  📖 Explore Book
</a>
      </div>
    ))}
</div>
<h2 id="motivation">🔥 Motivation & Self-Growth Books</h2>
<div className="books-grid">
  {filteredBooks
    .filter((book) => book.course === "Motivation")
    .map((book, index) => (
      <div key={`motivation-${index}`} className="book-card">
        <BookCover book={book} />
        <button
  onClick={() =>
    setWishlist((prev) =>
      prev.includes(book.title)
        ? prev.filter((title) => title !== book.title)
        : [...prev, book.title]
    )
  }
>
  {wishlist.includes(book.title) ? "❤️ Saved" : "🤍 Save to Wishlist"}
</button>
        <h3>{book.title}</h3>
        <p>Category: Motivation & Self-Growth</p>
        <a
  href={book.url}
  target="_blank"
  rel="noopener noreferrer"
  onClick={() => handleReadBook(book)}
>
  📖 Explore Book
</a>
      </div>
    ))}
</div>
      <h2 id="books">💻 BCA Books</h2>
<div className="books-grid">
      {filteredBooks.filter((book) => book.course.includes("BCA")).map((book, index) => (
        <div key={`${book.title}-${index}`} className="book-card">
          <BookCover book={book} />
          <h3>{book.title}</h3>
          <p>Course: {book.course}</p>
          <a
  href={book.url}
  target="_blank"
  rel="noopener noreferrer"
  onClick={() => handleReadBook(book)}
>
  📖 Read Free Book
</a>
        </div>
      ))}
      </div>
      <h2 id="btech">⚙️ B.Tech Books</h2>

<div className="books-grid">
  {filteredBooks
    .filter((book) => book.course.includes("B.Tech"))
    .map((book, index) => (
      <div key={`${book.title}-${index}`} className="book-card">
        <BookCover book={book} />
        <h3>{book.title}</h3>
        <p>Course: {book.course}</p>
        <a href={book.url} target="_blank" rel="noopener noreferrer">
          📖 Read Free Book
        </a>
      </div>
    ))}
</div>

<h2 id="bcom">📊 B.Com Books</h2>
<div className="books-grid">
  {filteredBooks
    .filter((book) => book.course.includes("B.Com"))
    .map((book, index) => (
      <div key={`${book.title}-${index}`} className="book-card">
        <BookCover book={book} />
        <h3>{book.title}</h3>
        <p>Course: {book.course}</p>
        <a href={book.url} target="_blank" rel="noopener noreferrer">
          📖 Read Free Book
        </a>
      </div>
    ))}
</div>
<h2 id="bba">💼 BBA Books</h2>
<div className="books-grid">
  {filteredBooks
    .filter((book) => book.course.split("/").map((c) => c.trim()).includes("BBA"))
    .map((book, index) => (
      <div key={`${book.title}-${index}`} className="book-card">
        <BookCover book={book} />
        <h3>{book.title}</h3>
        <p>Course: {book.course}</p>
        <a href={book.url} target="_blank" rel="noopener noreferrer">
          📖 Read Free Book
        </a>
      </div>
    ))}
</div>

<h2 id="ba">🎓 BA Books</h2>
<div className="books-grid">
  {filteredBooks
    .filter((book) =>
      book.course.split("/").map((c) => c.trim()).includes("BA")
    )
    .map((book, index) => (
      <div key={`${book.title}-${index}`} className="book-card">
        <BookCover book={book} />
        <h3>{book.title}</h3>
        <p>Course: {book.course}</p>
        <a href={book.url} target="_blank" rel="noopener noreferrer">
          📖 Read Free Book
        </a>
      </div>
    ))}
</div>

<h2 id="bsc">🔬 B.Sc Books</h2>
<div className="books-grid">
  {filteredBooks
    .filter((book) =>
      book.course.split("/").map((c) => c.trim()).includes("B.Sc")
    )
    .map((book, index) => (
      <div key={`${book.title}-${index}`} className="book-card">
        <BookCover book={book} />
        <h3>{book.title}</h3>
        <p>Course: {book.course}</p>
        <a href={book.url} target="_blank" rel="noopener noreferrer">
          📖 Read Free Book
        </a>
      </div>
    ))}
</div>

      <section id="about" className="studynova-about">
  <h2>✨ About StudyNova</h2>
  <p>
    StudyNova Digital Library is a free learning platform
    where students can explore educational books without login.
  </p>
  <p>📚 Learn More. Dream Bigger. Shine Brighter.</p>
</section>
      <StudyNovaAI />
    </div>
  );
}

export default StudyNova;
