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

	const schedule = mainEduPageClient.getSchedule()
	const subjectNames = mainEduPageClient.getSubjects()
	const teacherNames = mainEduPageClient.getTeachers()
	const classrooms = mainEduPageClient.getClassrooms()
	const lessonCountPerPeriod = mainEduPageClient.getLessonCountPerPeriod()

	const huePerTeachID = 360 / mainEduPageClient.getTeacherCount()
	const colsPerCol = lessonCountPerPeriod["max"]

	// Creating the elements for the top row
	let n = 0
	for(let day in schedule) {
		let date = new Date(day)
		let newTopRowEl = document.createElement("div")
		newTopRowEl.className = "day"

		newTopRowEl.style.gridColumn = `${n++ * colsPerCol + 1} / span ${colsPerCol}`
		newTopRowEl.style.gridRow = '1'

		newTopRowEl.innerHTML = `
			<h5>${new Intl.DateTimeFormat(locale, {weekday: 'long'}).format(date)}</h5>
			<p>${new Intl.DateTimeFormat(locale, {day: 'numeric', month: 'long'}).format(date)}</p>
		`

		scheduleEl.appendChild(newTopRowEl)
	}

	// Adding the lesson elements
	let maxPeriodCount = 0
	let dayCnt = 0
	for(let day in schedule) {
		for(let period in schedule[day]) {

			const colPerLesson = colsPerCol / lessonCountPerPeriod[day][period]
			for(let lesson in schedule[day][period]) {
				lesson = schedule[day][period][lesson]
				const curTeacher = teacherNames[lesson["teacherIDs"][0]]

				let newLessonEl = document.createElement("div")
				newLessonEl.className = "lesson"

				newLessonEl.style.gridRow = `${parseInt(period) + 1} / span ${lesson.length}`
				newLessonEl.style.gridColumn = `${dayCnt * colsPerCol + 1} / span ${colPerLesson}`

				newLessonEl.style.backgroundColor = `hsl(${Math.abs(lesson["teacherIDs"][0]) * huePerTeachID}, 100%, 75%)`

				newLessonEl.innerHTML = `
				<div class="leftCol">
					<h6>${subjectNames[lesson["subjectId"]]["short"]}</h6>
					<p class="taecher">${curTeacher["short"]}</p>
				</div>
				<span class="class">${classrooms[lesson["classroomIDs"][0]] === undefined ? "" : classrooms[lesson["classroomIDs"][0]]}</span>
				`

				scheduleEl.appendChild(newLessonEl)

				if(parseInt(period) + lesson.length > maxPeriodCount) {
					maxPeriodCount = parseInt(period) + lesson.length
				}
			}
		}
		dayCnt++
	}

	scheduleEl.style.setProperty("--colCount", String(dayCnt * colsPerCol))
	scheduleEl.style.setProperty("--rowCount", String(maxPeriodCount))
}