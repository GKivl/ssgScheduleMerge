export class eduPageClient {
	#teacherTable = {}
	#subjectTable = {}
	#classroomTable = {}
	#classesTable = {}
	#periodsTable = {}
	#scheduleTable = {}
	constructor(class_, week) {
		if(class_ === undefined) throw new Error("No class given")
		this.class = class_

		if(week === undefined) {
			console.warn("No week given, in result set to 0")
			this.week = 0
		} else this.week = week

		this.updateStaticContent()
		this.updateDynamicContent()
	}

	async updateStaticContent() {
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
						"periods": [
							"period",
							"starttime",
							"endtime"
						]
					}
					// This also seemingly exists
					// "needed_combos": {}
				}
			],
			// Doesn't work without
			"__gsh": "00000000"
		}
		const response = await fetch("https://cors-anywhere.herokuapp.com/https://svg.edupage.org/rpr/server/maindbi.js?__func=mainDBIAccessor", {
			method: "POST",
			body: JSON.stringify(mainDBIAccessorPayload)
		})

		const responseObj = JSON.parse(await response.text())["r"]["tables"]
		for (let table in responseObj) {
			switch (responseObj[table]["id"]) {
				case "teachers":
					for (let teacher in responseObj[table]["data_rows"]) {
						const curTeacher = responseObj[table]["data_rows"][teacher]
						// console.log(curTeacher)
						this.#teacherTable[curTeacher["id"]] = {
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

					console.log(this.#teacherTable)

					break

				case "subjects":
					for (let subject in responseObj[table]["data_rows"]) {
						const curSubject = responseObj[table]["data_rows"][subject]
						// console.log(curSubject)
						this.#subjectTable[curSubject["id"]] = {
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

					console.log(this.#subjectTable)
					break

				case "classrooms":
					for (let classroom in responseObj[table]["data_rows"]) {
						// console.log(responseObj[table]["data_rows"][classroom])
						this.#classroomTable[responseObj[table]["data_rows"][classroom]["id"]] = responseObj[table]["data_rows"][classroom]["short"]
					}

					console.log(this.#classroomTable)
					break

				case "classes":
					for (let class_ in responseObj[table]["data_rows"]) {
						const curClass = responseObj[table]["data_rows"][class_]
						// console.log(curClass)
						this.#classesTable[curClass["id"]] = {
							"name": curClass["name"],
							"short": curClass["short"]
						}
					}

					console.log(this.#classesTable)
					break

				case "periods": // Shouldn't have bothered
					for (let period in responseObj[table]["data_rows"]) {
						const curPeriod = responseObj[table]["data_rows"][period]
						// console.log(curPeriod)

						this.#periodsTable[curPeriod["period"]] = {
							"startTime": curPeriod["starttime"],
							"endTime": curPeriod["endtime"]
						}
					}

					console.log(this.#periodsTable)
					break
			}
		}
	}

	async updateDynamicContent() {
		const currentttGetDataPayload = {
			"__args": [null, {
				"year": 2024,
				"datefrom": this.currentWeekDates().firstDay,
				"dateto": this.currentWeekDates().lastDay,
				"table": "classes",
				"id": String(this.class),
				"showColors": true,
				"showIgroupsInClasses": false,
				"showOrig": true,
				"log_module": "CurrentTTView"
			}], "__gsh": "00000000"
		}
		const response = await fetch("https://cors-anywhere.herokuapp.com/https://svg.edupage.org/timetable/server/currenttt.js?__func=curentttGetData", {
			method: "POST",
			body: JSON.stringify(currentttGetDataPayload)
		})

		const responseObj = JSON.parse(await response.text())["r"]["ttitems"]
		for(let lesson in responseObj) {
			lesson = responseObj[lesson]
			if(this.#scheduleTable[lesson["date"]] === undefined)
				this.#scheduleTable[lesson["date"]] = {};
			if(this.#scheduleTable[lesson["date"]][lesson["uniperiod"]] === undefined)
				this.#scheduleTable[lesson["date"]][lesson["uniperiod"]] = [];

			this.#scheduleTable[lesson["date"]][lesson["uniperiod"]].push({
				"subjectId": lesson["subjectid"],
				"classIDs": lesson["classids"],
				"groupNames": lesson["groupnames"],
				"teacherIDs": lesson["teacherids"],
				"classroomIDs": lesson["classroomids"],
			});
		}
		console.log(this.#scheduleTable)
	}

	async incrementWeek(amount) {
		this.week += amount;

		await this.updateDynamicContent()
	}

	// Returns the date of the first and the last day of the current week
	currentWeekDates() {
		const today = new Date();

		// Get the current day of the week (0 for Sunday, 6 for Saturday)
		const dayOfWeek = today.getDay();

		const firstDayOfWeek = new Date(today);
		firstDayOfWeek.setDate(today.getDate() - dayOfWeek + (this.week * 7));

		const lastDayOfWeek = new Date(today);
		lastDayOfWeek.setDate(today.getDate() + (6 - dayOfWeek) + (this.week * 7));

		return {
			firstDay: firstDayOfWeek.toISOString().slice(0, 10),
			lastDay: lastDayOfWeek.toISOString().slice(0, 10)
		};
	}

	static async getClasses() {
		const requestPayload = {
			"__args": [
				null,
				new Date().getFullYear(), // This year
				{},
				{
					"op": "fetch",
					"needed_part": {
						"classes": [
							"short",
							"name"
						]
					}
				}
			],
			"__gsh": "00000000"
		}
		const response = await fetch("https://cors-anywhere.herokuapp.com/https://svg.edupage.org/rpr/server/maindbi.js?__func=mainDBIAccessor", {
			method: "POST",
			body: JSON.stringify(requestPayload)
		})

		let result = await response.text()
		result = JSON.parse(result)["r"]["tables"][0]["data_rows"]

		let classes = {}

		for(let class_ in result) {
			classes[result[class_]["name"]] = result[class_]["id"]
		}

		return classes
	}
}