import eduPageClient from "./eduPageClient.js"

const locale = 'lv-LV'

let mainEduPageClient
const classSelectEl = document.querySelector("#class")
const classSelectButtonEl = document.querySelector("#selectClass")
const scheduleEl = document.querySelector("#schedule")

const classesTable = await eduPageClient.getClasses()
let classIdList = []
for (let class_ in classesTable) {
	let newOption = document.createElement("option")

	newOption.innerText = class_
	newOption.value = classesTable[class_]
	classIdList.push(classesTable[class_])

	classSelectEl.appendChild(newOption)
}

// When the "Select"(Atlasīt) button is clicked
classSelectButtonEl.onclick = () => {
	if (mainEduPageClient === undefined) {
		mainEduPageClient = new eduPageClient(classSelectButtonEl.value, 0, regenContent)
	} else {
		mainEduPageClient.changeClass(classSelectEl.value)
	}
}

function regenContent() {
	classSelectEl.value = mainEduPageClient.getCurClass()
	scheduleEl.innerHTML = ""

	const periodTimes = mainEduPageClient.getPeriodsTimes()
	const schedule = mainEduPageClient.getSchedule()
	const subjectNames = mainEduPageClient.getSubjects()
	const teacherNames = mainEduPageClient.getTeachers()
	const classrooms = mainEduPageClient.getClassrooms()
	const huePerTeachID = 360 / mainEduPageClient.getTeacherCount()

	for(let day in schedule) {
		let newCol = document.createElement("div")
		newCol.className = "day"

		const date = new Date(day)
		let topRowElement = document.createElement("div")
		topRowElement.className = "topRow"
		topRowElement.innerHTML = `
			<h5>${new Intl.DateTimeFormat(locale, {weekday: 'long'}).format(date)}</h5>
			<p>${new Intl.DateTimeFormat(locale, {day: 'numeric', month: 'long'}).format(date)}</p>
		`

		newCol.appendChild(topRowElement)

		for(let period in periodTimes) {
			let newPeriod = document.createElement("div")
			newPeriod.className = "period"

			if(schedule[day][period] !== undefined) {
				const curPeriod = schedule[day][period]
				const curTeacher = teacherNames[curPeriod[0]["teacherIDs"][0]]

				newPeriod.innerHTML = `
					<div class="leftCol">
						<h6>${subjectNames[curPeriod[0]["subjectId"]]["short"]}</h6>
						<p class="taecher">${curTeacher["short"]}</p>
					</div>
					<span class="class">${classrooms[curPeriod[0]["classroomIDs"][0]] === undefined ? "" : classrooms[curPeriod[0]["classroomIDs"][0]]}</span>
				`
			}

			newCol.appendChild(newPeriod)
		}

		// scheduleEl.appendChild(newCol)
	}

	// Top row stuff
	let topRowEl = document.createElement("tr")
	for(let day in schedule) {
		let date = new Date(day)
		let newTHEl = document.createElement("th")
		newTHEl.className = "day"

		newTHEl.innerHTML = `
			<h5>${new Intl.DateTimeFormat(locale, {weekday: 'long'}).format(date)}</h5>
			<p>${new Intl.DateTimeFormat(locale, {day: 'numeric', month: 'long'}).format(date)}</p>
		`

		topRowEl.appendChild(newTHEl)
	}
	scheduleEl.appendChild(topRowEl)

	// The rest
	for(let period in periodTimes) {
		let newTREl = document.createElement("tr")

		for(let day in schedule) {
			if(schedule[day][period] !== undefined) {
				const curPeriod = schedule[day][period]
				const curTeacher = teacherNames[curPeriod[0]["teacherIDs"][0]]

				let newTDEl = document.createElement("td")
				newTDEl.className = "period"
				newTDEl.style.backgroundColor = `hsl(${Math.abs(curPeriod[0]["teacherIDs"][0]) * huePerTeachID}, 100%, 75%)`
				newTDEl.innerHTML = `
				<div>
					<div class="leftCol">
						<h6>${subjectNames[curPeriod[0]["subjectId"]]["short"]}</h6>
						<p class="taecher">${curTeacher["short"]}</p>
					</div>
					<span class="class">${classrooms[curPeriod[0]["classroomIDs"][0]] === undefined ? "" : classrooms[curPeriod[0]["classroomIDs"][0]]}</span>
				</div>
				`

				if(curPeriod[0].length > 1)
					newTDEl.rowSpan = curPeriod[0].length

				newTREl.appendChild(newTDEl)
			}
		}
		scheduleEl.appendChild(newTREl)
	}
}