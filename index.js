(async function initDashboard() {
    let authorLink = ""

    try {
        const res = await fetch(
            "https://apis.scrimba.com/unsplash/photos/random?orientation=landscape&query=nature"
        )
        const data = await res.json()
        authorLink = data.user.links.html

        document.body.style.backgroundImage = `url(${data.urls.regular})`
        document.getElementById("author").textContent = `By: ${data.user.name}`
    } catch (err) {
        document.body.style.backgroundImage = `url(https://images.unsplash.com/photo-1560008511-11c63416e52d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080)`
        document.getElementById("author").textContent = `By: Dodi Achmad`
        console.error("Background fetch failed:", err)
    }
    document.getElementById("author").addEventListener("click", () => {
        if (authorLink) {
            window.open(authorLink, "_blank")
        }
    })

    try {
        const res = await fetch(
            "https://api.github.com/users/nihal1087/repos?sort=updated&per_page=3"
        )
        if (!res.ok) throw Error("GitHub data unavailable")
        const repos = await res.json()

        const topRepos = repos
            .map(
                (repo) => `
                <div class="repo">
                    <a href="${repo.html_url}" target="_blank">${repo.name}</a>
                    <p>${repo.language || "Unknown"}</p>
                </div>
            `
            )
            .join("")

        document.getElementById("gitHub").innerHTML = `
            <h3>🧑‍💻 Latest Repos</h3>
            ${topRepos}
        `
    } catch (err) {
        console.error("GitHub fetch failed:", err)
        document.getElementById(
            "gitHub"
        ).innerHTML = `<p>GitHub data unavailable</p>`
    }
    async function loadLeetCodeStats() {
    const username = "name_is_nihal"

    try {
        const res = await fetch(
            `https://leetcode-stats-api.herokuapp.com/${username}`
        )
        if (!res.ok) throw Error("LeetCode data unavailable")

        const data = await res.json()

        const total = data.totalSolved

        const sections = [
            { label: "Easy", value: data.easySolved, color: "#1DBBBA" },
            { label: "Medium", value: data.mediumSolved, color: "#FEB701" },
            { label: "Hard", value: data.hardSolved, color: "#F73637" }
        ]

        const radius = 75
        const center = 90
        let cumulativeAngle = 0

        function polarToCartesian(cx, cy, r, angle) {
            const rad = (angle - 90) * Math.PI / 180
            return {
                x: cx + r * Math.cos(rad),
                y: cy + r * Math.sin(rad)
            }
        }

        function describeArc(startAngle, endAngle) {
            const start = polarToCartesian(center, center, radius, endAngle)
            const end = polarToCartesian(center, center, radius, startAngle)
            const largeArc = endAngle - startAngle > 180 ? 1 : 0

            return `
                M ${center} ${center}
                L ${start.x} ${start.y}
                A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}
                Z
            `
        }

        let slices = ""

        sections.forEach((sec, i) => {
            const angle = (sec.value / total) * 360
            const start = cumulativeAngle
            const end = cumulativeAngle + angle
            cumulativeAngle += angle

            const percent = ((sec.value / total) * 100).toFixed(1)

            slices += `
                <path
                    class="slice"
                    d="${describeArc(start, end)}"
                    fill="${sec.color}"
                    style="animation-delay:${i * 0.15}s"
                    data-label="${sec.label}"
                    data-value="${sec.value}"
                    data-percent="${percent}"
                />
            `
        })

        document.getElementById("leetcode").innerHTML = `
            <div class="leetcode">
                <h3>
                    <a href="https://leetcode.com/${username}" target="_blank">
                        📘 LeetCode
                    </a>
                </h3>

                <svg viewBox="0 0 180 180">
                    ${slices}

                    <!-- donut hole -->
                    <circle cx="90" cy="90" r="55" fill="#1e1e1e" />

                    <!-- center text -->
                    <text id="center-title" x="90" y="85" text-anchor="middle"
                        fill="#f4ebc7" class="center-title">
                        Total
                    </text>

                    <text id="center-sub" x="90" y="102" text-anchor="middle"
                        fill="#f4ebc7" class="center-sub">
                        ${total} solved
                    </text>
                </svg>
            </div>
        `

        const title = document.getElementById("center-title")
        const sub = document.getElementById("center-sub")

        document.querySelectorAll(".slice").forEach(slice => {
            slice.addEventListener("mouseenter", () => {
                title.textContent = slice.dataset.label
                sub.textContent =
                    `${slice.dataset.value} solved (${slice.dataset.percent}%)`
            })

            slice.addEventListener("mouseleave", () => {
                title.textContent = "Total"
                sub.textContent = `${total} solved`
            })
        })

    } catch (err) {
        console.error(err)
        document.getElementById("leetcode").innerHTML = `
            <div class="leetcode">
                <h3>📘 LeetCode</h3>
                <p>Stats unavailable</p>
            </div>
        `
    }
}

loadLeetCodeStats()

    
    function getCurrentTime() {
        const date = new Date()
        document.getElementById("time").textContent = date.toLocaleTimeString(
            "en-us",
            { timeStyle: "short" }
        )
    }
    setInterval(getCurrentTime, 60000)
    getCurrentTime()

    try {
        const res = await fetch("https://zenquotes.io/api/random")
        const data = await res.json()
        document.getElementById("quote-text").textContent = `"${data[0].q}"`
        document.getElementById("quote-author").textContent = `- ${data[0].a}`
    } catch (err) {
        console.error("Quote fetch failed:", err)
        document.getElementById(
            "quote-text"
        ).textContent = `"Stay positive, work hard, make it happen."`
        document.getElementById("quote-author").textContent = `- Unknown`
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
        try {
            const res = await fetch(
                `https://apis.scrimba.com/openweathermap/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&units=metric`
            )
            if (!res.ok) throw Error("Weather data not available")
            const data = await res.json()
            const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`

            document.getElementById("weather").innerHTML = `
                <img src=${iconUrl} />
                <p class="weather-temp">${Math.round(data.main.temp)}ºC</p>
                <p class="weather-city">${data.name}</p>
            `
        } catch (err) {
            console.error("Weather fetch failed:", err)
            document.getElementById("weather").textContent =
                "Weather data unavailable"
        }
    })
})()
