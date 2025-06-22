const dateToTime = (dateObj) => {
    const p = i => i.toString().padStart(2, "0");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const g = s => p(dateObj["get" + s]());

    return [`${g("Date")} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`, `${g("Hours")}:${g("Minutes")}:${g("Seconds")}`];
}

const detailsFromUrl = (url) => {
    const urlObj = new URL(url);
    if (!urlObj.hash || urlObj.hash === "#") return false;
    const params = new URLSearchParams(urlObj.hash.slice(1)); // Remove starting #

    const timestamp = +params.get("timestamp");
    const eventName = params.get("name");

    if (!timestamp || !eventName) return false;

    const eventLoc = params.get("loc"); // This is optional
    const eventDesc = (params.get("desc") || "").replaceAll("$n", "\n").replaceAll("$$", "$$") || null; // This is optional - replacement changes $$ to $ and $n to \n

    const schedule = JSON.parse(params.get("schedule") || "[]"); // optional
    // Schedule format:
    /* 
        [
            {
                "t": (number) epoch timestamp,
                "n": (string) name
            }
            ...
        ]
    */

    return {
        timestamp,
        name: eventName,
        loc: eventLoc,
        desc: eventDesc,
        schedule
    }
}

const init = () => {
    if (!location.hash) location.replace("./create.html");
    let details;
    try {
        details = detailsFromUrl(location.href);
    } catch(e) {
        console.log(e);
        alert("An error occurred. The URL may be malformed.");
        location.replace("./create.html");
        return;
    }
    if (!details) {
        alert("The URL is malformed.");
        location.replace("./create.html");
        return;
    }

    // Define references
    const eventNameHolder = document.querySelector("#header");
    const eventTimeHolder = document.querySelector("#event-time");
    const eventDateHolder = document.querySelector("#event-date");
    const eventDescHolder = document.querySelector("#event-desc");
    const eventLocHolder = document.querySelector("#event-loc");
    const scheduleHolder = document.querySelector(".schedule");

    eventNameHolder.textContent = details.name;
    document.title = details.name;
    const eventDateObj = new Date(details.timestamp);
    eventTimeHolder.textContent = dateToTime(eventDateObj)[1];
    eventDateHolder.textContent = dateToTime(eventDateObj)[0];
    if (details.desc) eventDescHolder.innerText = details.desc;
    if (details.loc) eventLocHolder.textContent = "Location: " + details.loc;

    if (details.schedule && details.schedule.length > 0) {
        for (let item of details.schedule) {
            const itemDate = new Date(item.t);
            const itemName = item.n;
            if (!itemDate || !itemName || !item.t) continue;

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>
                    <span class="big bold" style="margin-bottom: 8px;">
                        <time datetime="${itemDate.toISOString()}">
                            ${dateToTime(itemDate)[1]}
                        </time>
                    </span>
                    <span>
                        ${dateToTime(itemDate)[0]}
                    </span>
                    <!-- <span>
                        Event Plaza
                    </span> -->
                </td>
                <td>
                    ${itemName}
                </td>
            `;
            scheduleHolder.append(row);
        }
    }
}

init();