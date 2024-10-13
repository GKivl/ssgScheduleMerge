let teacherTable = {}
let subjectTable = {}
let classroomTable = {}
let classesTable = {}
let periodsTable = {}
let scheduleTable = {}

const mainDBIAccessorPayload = {
	"__args": [
		null,
		new Date().getFullYear(), // This year
		{
			// Not sure about this, because this info shouldn't really change(I think)
			/* "vt_filter": {
				"datefrom": "2024-09-30",
				"dateto": "2024-10-06"
			} */
		},
		{
			"op": "fetch",
			"needed_part": {
				"teachers": [
					"firstname",
					"lastname"
				],
				"classes": [
					"short",
					"name"
				],
				"classrooms": [
					"short"
				],
				"subjects": [
					"name"
				],
				"periods": [ //Should be able to get rid of this
					"period",
					"starttime",
					"endtime"
				]
			}
			// Not sure how this is supposed to be used
			// "needed_combos": {}
		}
	],
	// Doesn't work without
	"__gsh": "00000000"
}
fetch("https://cors-anywhere.herokuapp.com/https://svg.edupage.org/rpr/server/maindbi.js?__func=mainDBIAccessor", {
	method: "POST",
	body: JSON.stringify(mainDBIAccessorPayload)
})
	.then(response => response.text())
	.then(result => JSON.parse(result)["r"]["tables"])
	.then(responseObj => {
		for (let table in responseObj) {
			switch (responseObj[table]["id"]) {
				case "teachers":
					for (let teacher in responseObj[table]["data_rows"]) {
						const curTeacher = responseObj[table]["data_rows"][teacher]
						// console.log(curTeacher)
						teacherTable[curTeacher["id"]] = {
							"firstName": curTeacher["firstname"].replaceAll("�", ""),
							"lastName": curTeacher["lastname"].replaceAll("�", ""),
							"short": (() => {
								let result = ""

								const names = curTeacher["firstname"].replaceAll("�", "").split(" ")
								for (let name in names) {
									result += names[name][0]
								}

								result += curTeacher["lastname"].replaceAll("�", "").substring(0, 3)

								return result
							})()
						}
					}

					console.log(teacherTable)

					break

				case "subjects":
					for (let subject in responseObj[table]["data_rows"]) {
						const curSubject = responseObj[table]["data_rows"][subject]
						// console.log(curSubject)
						subjectTable[curSubject["id"]] = {
							"name": curSubject["name"].replaceAll("�", ""),
							"short": (() => {
								let result = ""

								const subjectNameSplit = curSubject["name"].replaceAll("�", "").split(" ")
								for (let word in subjectNameSplit) {
									word = subjectNameSplit[word].substring(0, 3)
									result += word.charAt(0).toUpperCase() + word.slice(1)
								}

								return result
							})()
						}
					}

					console.log(subjectTable)
					break

				case "classrooms":
					for (let classroom in responseObj[table]["data_rows"]) {
						// console.log(responseObj[table]["data_rows"][classroom])
						classroomTable[responseObj[table]["data_rows"][classroom]["id"]] = responseObj[table]["data_rows"][classroom]["short"]
					}

					console.log(classroomTable)
					break

				case "classes":
					for (let class_ in responseObj[table]["data_rows"]) {
						const curClass = responseObj[table]["data_rows"][class_]
						// console.log(curClass)
						classesTable[curClass["id"]] = {
							"name": curClass["name"],
							"short": curClass["short"]
						}
					}

					console.log(classesTable)
					break

				case "periods": // Shouldn't have bothered
					for (let period in responseObj[table]["data_rows"]) {
						const curPeriod = responseObj[table]["data_rows"][period]
						// console.log(curPeriod)

						periodsTable[curPeriod["period"]] = {
							"startTime": curPeriod["starttime"],
							"endTime": curPeriod["endtime"]
						}
					}

					console.log(periodsTable)
					break
			}
		}
	})

const currentttGetDataPayload = {
	"__args": [null, {
		"year": 2024,
		"datefrom": "2024-10-07",
		"dateto": "2024-10-20",
		"table": "classes",
		"id": "-7",
		"showColors": true,
		"showIgroupsInClasses": false,
		"showOrig": true,
		"log_module": "CurrentTTView"
	}], "__gsh": "00000000"
}
fetch("https://cors-anywhere.herokuapp.com/https://svg.edupage.org/timetable/server/currenttt.js?__func=curentttGetData", {
	method: "POST",
	body: JSON.stringify(currentttGetDataPayload)
})
	.then(response => response.text())
	.then(result => JSON.parse(result)["r"]["ttitems"])
    .then(responseObj => {
		for(let lesson in responseObj) {
			lesson = responseObj[lesson]
			if(scheduleTable[lesson["date"]] === undefined)
				scheduleTable[lesson["date"]] = {};
			if(scheduleTable[lesson["date"]][lesson["uniperiod"]] === undefined)
				scheduleTable[lesson["date"]][lesson["uniperiod"]] = [];

			scheduleTable[lesson["date"]][lesson["uniperiod"]].push({
                "subjectId": lesson["subjectid"],
				"classIDs": lesson["classids"],
				"groupNames": lesson["groupnames"],
				"teacherIDs": lesson["teacherids"],
				"classroomIDs": lesson["classroomids"],
			});
		}
		console.log(scheduleTable)
	})