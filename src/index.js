let teacherTable = {}
let subjectTable = {}
let classroomTable = {}
let classesTable = {}
let periodsTable = {}

const raw = "{\"__args\":[null,2024,{\"vt_filter\":{\"datefrom\":\"2024-09-30\",\"dateto\":\"2024-10-06\"}},{\"op\":\"fetch\",\"needed_part\":{\"teachers\":[\"short\",\"name\",\"firstname\",\"lastname\",\"callname\",\"subname\",\"code\",\"cb_hidden\",\"expired\",\"firstname\",\"lastname\",\"short\"],\"classes\":[\"short\",\"name\",\"firstname\",\"lastname\",\"callname\",\"subname\",\"code\",\"classroomid\"],\"classrooms\":[\"short\",\"name\",\"firstname\",\"lastname\",\"callname\",\"subname\",\"code\",\"name\",\"short\"],\"igroups\":[\"short\",\"name\",\"firstname\",\"lastname\",\"callname\",\"subname\",\"code\"],\"students\":[\"short\",\"name\",\"firstname\",\"lastname\",\"callname\",\"subname\",\"code\",\"classid\"],\"subjects\":[\"short\",\"name\",\"firstname\",\"lastname\",\"callname\",\"subname\",\"code\",\"name\",\"short\"],\"events\":[\"typ\",\"name\"],\"event_types\":[\"name\",\"icon\"],\"subst_absents\":[\"date\",\"absent_typeid\",\"groupname\"],\"periods\":[\"short\",\"name\",\"firstname\",\"lastname\",\"callname\",\"subname\",\"code\",\"period\",\"starttime\",\"endtime\"],\"dayparts\":[\"starttime\",\"endtime\"],\"dates\":[\"tt_num\",\"tt_day\"]},\"needed_combos\":{}}],\"__gsh\":\"00000000\"}"

const requestOptions = {
    method: "POST",
    body: raw,
    redirect: "follow"
}

fetch("https://cors-anywhere.herokuapp.com/https://svg.edupage.org/rpr/server/maindbi.js?__func=mainDBIAccessor", requestOptions)
    .then(response => response.text())
    .then(result => JSON.parse(result)["r"]["tables"])
    .then(responseObj => {
        for (let table in responseObj) {
            switch (responseObj[table]["id"]) {
                case "teachers":
                    for (let teacher in responseObj[table]["data_rows"]) {
                        const curTeacher = responseObj[table]["data_rows"][teacher]
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
                        classroomTable[responseObj[table]["data_rows"][classroom]["id"]] = responseObj[table]["data_rows"][classroom]["short"]
                    }

                    console.log(classroomTable)

                    break

                case "classes":
                    for (let class_ in responseObj[table]["data_rows"]) {
                        const curClass = responseObj[table]["data_rows"][class_]
                        classesTable[curClass["id"]] = {
                            "name": curClass["name"],
                            "short": curClass["short"]
                        }
                    }

                    console.log(classesTable)

                    break

                case "periods": // Shouldn't have bothered
                    for (let period in responseObj[table]["data_rows"]) {
                        curPeriod = responseObj[table]["data_rows"][period]

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
