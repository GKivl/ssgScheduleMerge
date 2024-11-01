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
		mainEduPageClient = new eduPageClient(classSelectEl.value, 0, regenContent)
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
	const lessonCountPerPeriod = mainEduPageClient.GetLessonCountPerPeriod()

	const huePerTeachID = 360 / mainEduPageClient.getTeacherCount()
	const colsPerCol = lessonCountPerPeriod["max"]

	// Probably, don't need this... Why is it here anyway?
	// for(let day in schedule) {
	// 	let newCol = document.createElement("div")
	// 	newCol.className = "day"
	//
	// 	const date = new Date(day)
	// 	let topRowElement = document.createElement("div")
	// 	topRowElement.className = "topRow"
	// 	topRowElement.innerHTML = `
	// 		<h5>${new Intl.DateTimeFormat(locale, {weekday: 'long'}).format(date)}</h5>
	// 		<p>${new Intl.DateTimeFormat(locale, {day: 'numeric', month: 'long'}).format(date)}</p>
	// 	`
	//
	// 	newCol.appendChild(topRowElement)
	//
	// 	for(let period in periodTimes) {
	// 		let newPeriod = document.createElement("div")
	// 		newPeriod.className = "period"
	//
	// 		if(schedule[day][period] !== undefined) {
	// 			const curPeriod = schedule[day][period]
	// 			const curTeacher = teacherNames[curPeriod[0]["teacherIDs"][0]]
	//
	// 			newPeriod.innerHTML = `
	// 				<div class="leftCol">
	// 					<h6>${subjectNames[curPeriod[0]["subjectId"]]["short"]}</h6>
	// 					<p class="taecher">${curTeacher["short"]}</p>
	// 				</div>
	// 				<span class="class">${classrooms[curPeriod[0]["classroomIDs"][0]] === undefined ? "" : classrooms[curPeriod[0]["classroomIDs"][0]]}</span>
	// 			`
	// 		}
	//
	// 		newCol.appendChild(newPeriod)
	// 	}
	//
	// 	// scheduleEl.appendChild(newCol)
	// }

	// Creating the elements for the top row
	let n = 1
	for(let day in schedule) {
		let date = new Date(day)
		let newTopRowEl = document.createElement("div")
		newTopRowEl.className = "day"

		newTopRowEl.style.gridColumn = `${n++} / span ${colsPerCol}`
		newTopRowEl.style.gridRow = '0'

		newTopRowEl.innerHTML = `
			<h5>${new Intl.DateTimeFormat(locale, {weekday: 'long'}).format(date)}</h5>
			<p>${new Intl.DateTimeFormat(locale, {day: 'numeric', month: 'long'}).format(date)}</p>
		`

		scheduleEl.appendChild(newTopRowEl)
	}

	// The rest
	for(let period in periodTimes) {
		let n = 1
		for(let day in schedule) {
			if(schedule[day][period] !== undefined) {
				const curPeriod = schedule[day][period]
				const curTeacher = teacherNames[curPeriod[0]["teacherIDs"][0]]

				let newLessonEl = document.createElement("div")
				newLessonEl.className = "lesson"

				newLessonEl.style.gridRow = `${parseInt(period) +1} / span ${curPeriod[0].length}`
				newLessonEl.style.gridColumn = `${n}`

				newLessonEl.style.backgroundColor = `hsl(${Math.abs(curPeriod[0]["teacherIDs"][0]) * huePerTeachID}, 100%, 75%)`

				newLessonEl.innerHTML = `
				<div class="leftCol">
					<h6>${subjectNames[curPeriod[0]["subjectId"]]["short"]}</h6>
					<p class="taecher">${curTeacher["short"]}</p>
				</div>
				<span class="class">${classrooms[curPeriod[0]["classroomIDs"][0]] === undefined ? "" : classrooms[curPeriod[0]["classroomIDs"][0]]}</span>
				`

				scheduleEl.appendChild(newLessonEl)
			}
			n++
		}
	}
}