const config = {
    githubUsername: "nihal1087",
    leetCodeUsername: "name_is_nihal",
    leetCodeApiBaseUrl: "https://alfa-leetcode-api.onrender.com",
    fallbackBackground:
        "https://images.unsplash.com/photo-1560008511-11c63416e52d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
}

const elements = {
    author: document.getElementById("author"),
    github: document.getElementById("gitHub"),
    leetcode: document.getElementById("leetcode"),
    quoteText: document.getElementById("quote-text"),
    quoteAuthor: document.getElementById("quote-author"),
    time: document.getElementById("time"),
    weather: document.getElementById("weather")
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;")
}

function safeNumber(value) {
    const number = Number(value)
    return Number.isFinite(number) ? number : 0
}

async function fetchJson(url, errorMessage) {
    const res = await fetch(url)
    if (!res.ok) throw Error(`${errorMessage} (${res.status})`)
    return res.json()
}

function setBackgroundImage(url) {
    const backgroundImage = `url("${url}")`
    document.documentElement.style.backgroundImage = backgroundImage
    document.body.style.backgroundImage = backgroundImage
}

async function loadBackground() {
    let authorLink = ""

    try {
        const data = await fetchJson(
            "https://apis.scrimba.com/unsplash/photos/random?orientation=landscape&query=nature",
            "Background data unavailable"
        )

        authorLink = data.user.links.html
        setBackgroundImage(data.urls.regular)
        elements.author.textContent = `By: ${data.user.name}`
    } catch (err) {
        setBackgroundImage(config.fallbackBackground)
        elements.author.textContent = "By: Dodi Achmad"
        console.error("Background fetch failed:", err)
    }

    elements.author.addEventListener("click", () => {
        if (authorLink) {
            window.open(authorLink, "_blank", "noreferrer")
        }
    })
}

async function loadGitHubRepos() {
    try {
        const repos = await fetchJson(
            `https://api.github.com/users/${config.githubUsername}/repos?sort=updated&per_page=3`,
            "GitHub data unavailable"
        )

        const topRepos = repos
            .map(
                (repo) => `
                    <div class="repo">
                        <a href="${repo.html_url}" target="_blank" rel="noreferrer">
                            ${escapeHtml(repo.name)}
                        </a>
                        <p>${escapeHtml(repo.language || "Unknown")}</p>
                    </div>
                `
            )
            .join("")

        elements.github.innerHTML = `
            <h2>Latest Repos</h2>
            <div class="repo-list">
                ${topRepos}
            </div>
        `
    } catch (err) {
        console.error("GitHub fetch failed:", err)
        elements.github.innerHTML = '<p class="panel-status">GitHub data unavailable</p>'
    }
}

function getLeetCodeDifficultyCount(data, difficulty) {
    const submissions = Array.isArray(data.acSubmissionNum) ? data.acSubmissionNum : []
    const entry = submissions.find((item) => item.difficulty === difficulty)
    return safeNumber(entry?.count)
}

function normalizeLeetCodeStats(data) {
    const easySolved = safeNumber(data.easySolved) || getLeetCodeDifficultyCount(data, "Easy")
    const mediumSolved =
        safeNumber(data.mediumSolved) || getLeetCodeDifficultyCount(data, "Medium")
    const hardSolved = safeNumber(data.hardSolved) || getLeetCodeDifficultyCount(data, "Hard")
    const totalSolved =
        safeNumber(data.solvedProblem) ||
        getLeetCodeDifficultyCount(data, "All") ||
        easySolved + mediumSolved + hardSolved

    return {
        totalSolved,
        sections: [
            { label: "Easy", value: easySolved, color: "#1DBBBA" },
            { label: "Medium", value: mediumSolved, color: "#FEB701" },
            { label: "Hard", value: hardSolved, color: "#F73637" }
        ]
    }
}

function buildLeetCodeSlices(sections, chartTotal) {
    const radius = 64
    const center = 90
    const circumference = 2 * Math.PI * radius
    const gap = 5
    let offset = 0
    let slices = ""

    sections.forEach((section, index) => {
        if (!section.value) return

        const segmentLength = (section.value / chartTotal) * circumference
        const visibleLength = Math.max(segmentLength - gap, 0)
        const percent = ((section.value / chartTotal) * 100).toFixed(1)

        slices += `
            <circle
                class="slice"
                cx="${center}"
                cy="${center}"
                r="${radius}"
                fill="none"
                stroke="${section.color}"
                stroke-width="16"
                stroke-linecap="round"
                stroke-dasharray="${visibleLength} ${circumference - visibleLength}"
                stroke-dashoffset="${-offset}"
                transform="rotate(-90 ${center} ${center})"
                style="animation-delay:${index * 0.15}s"
                data-label="${section.label}"
                data-value="${section.value}"
                data-percent="${percent}"
            />
        `
        offset += segmentLength
    })

    return slices
}

function renderLeetCodeUnavailable() {
    elements.leetcode.innerHTML = `
        <h2>
            <a href="https://leetcode.com/${config.leetCodeUsername}" target="_blank" rel="noreferrer">
                LeetCode
            </a>
        </h2>
        <p class="leetcode-status">Stats unavailable</p>
    `
}

async function loadLeetCodeStats() {
    elements.leetcode.innerHTML = `
        <h2>
            <a href="https://leetcode.com/${config.leetCodeUsername}" target="_blank" rel="noreferrer">
                LeetCode
            </a>
        </h2>
        <p class="leetcode-status">Loading stats...</p>
    `

    try {
        const data = await fetchJson(
            `${config.leetCodeApiBaseUrl}/${config.leetCodeUsername}/solved`,
            "LeetCode data unavailable"
        )
        const { totalSolved, sections } = normalizeLeetCodeStats(data)
        const chartTotal = sections.reduce((sum, section) => sum + section.value, 0)

        if (!chartTotal) throw Error("LeetCode stats are empty")

        elements.leetcode.innerHTML = `
            <h2>
                <a href="https://leetcode.com/${config.leetCodeUsername}" target="_blank" rel="noreferrer">
                    LeetCode
                </a>
            </h2>

            <svg viewBox="0 0 180 180" role="img" aria-label="LeetCode solved problems by difficulty">
                <circle class="chart-track" cx="90" cy="90" r="64" />
                ${buildLeetCodeSlices(sections, chartTotal)}
                <text id="center-title" x="90" y="85" text-anchor="middle"
                    class="center-title">
                    Total
                </text>
                <text id="center-sub" x="90" y="102" text-anchor="middle"
                    class="center-sub">
                    ${totalSolved || chartTotal} solved
                </text>
            </svg>

            <div class="leetcode-stats">
                ${sections
                    .map(
                        (section) => `
                            <span style="--stat-color:${section.color}">
                                <i class="stat-dot" aria-hidden="true"></i>
                                ${section.label}: ${section.value}
                            </span>
                        `
                    )
                    .join("")}
            </div>
        `

        const title = elements.leetcode.querySelector("#center-title")
        const sub = elements.leetcode.querySelector("#center-sub")

        elements.leetcode.querySelectorAll(".slice").forEach((slice) => {
            slice.addEventListener("mouseenter", () => {
                title.textContent = slice.dataset.label
                sub.textContent = `${slice.dataset.value} solved (${slice.dataset.percent}%)`
            })

            slice.addEventListener("mouseleave", () => {
                title.textContent = "Total"
                sub.textContent = `${totalSolved || chartTotal} solved`
            })
        })
    } catch (err) {
        console.error("LeetCode fetch failed:", err)
        renderLeetCodeUnavailable()
    }
}

function startClock() {
    function getCurrentTime() {
        const date = new Date()
        elements.time.textContent = date.toLocaleTimeString("en-us", { timeStyle: "short" })
    }

    getCurrentTime()
    setInterval(getCurrentTime, 60000)
}

async function loadQuote() {
    try {
        const data = await fetchJson("https://zenquotes.io/api/random", "Quote data unavailable")
        elements.quoteText.textContent = `"${data[0].q}"`
        elements.quoteAuthor.textContent = `- ${data[0].a}`
    } catch (err) {
        console.error("Quote fetch failed:", err)
        elements.quoteText.textContent = `"Stay positive, work hard, make it happen."`
        elements.quoteAuthor.textContent = "- Unknown"
    }
}

function loadWeather() {
    if (!navigator.geolocation) {
        elements.weather.innerHTML = '<p class="weather-status">Weather data unavailable</p>'
        return
    }

    elements.weather.innerHTML = '<p class="weather-status">Loading weather...</p>'

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            try {
                const data = await fetchJson(
                    `https://apis.scrimba.com/openweathermap/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&units=metric`,
                    "Weather data unavailable"
                )
                const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`

                elements.weather.innerHTML = `
                    <img src="${iconUrl}" alt="${escapeHtml(data.weather[0].description)}" />
                    <p class="weather-temp">${Math.round(data.main.temp)}&deg;C</p>
                    <p class="weather-city">${escapeHtml(data.name)}</p>
                `
            } catch (err) {
                console.error("Weather fetch failed:", err)
                elements.weather.innerHTML = '<p class="weather-status">Weather data unavailable</p>'
            }
        },
        () => {
            elements.weather.innerHTML = '<p class="weather-status">Weather permission needed</p>'
        }
    )
}

function initDashboard() {
    loadBackground()
    loadGitHubRepos()
    loadLeetCodeStats()
    startClock()
    loadQuote()
    loadWeather()
}

initDashboard()
