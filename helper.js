class Helper{
    constructor(){
        if(!localStorage.getItem("students")){
            var students = [];
            localStorage.setItem("students", JSON.stringify(students));
        }
        this.buttons_to_outputs = {}
    }

    _sortByName(student_list){
        return student_list.sort(function(obj1, obj2){
            let obj1_fname = obj1.first_name.toLowerCase();
            let obj1_lname = obj1.last_name.toLowerCase();

            let obj2_fname = obj2.first_name.toLowerCase();
            let obj2_lname = obj2.last_name.toLowerCase();

            if (obj1_lname > obj2_lname){
                return 1;
            } else if(obj1_lname < obj2_lname){
                return -1;
            }else{
                if (obj1_fname > obj2_fname){
                    return 1;
                } else if (obj1_fname < obj2_fname){
                    return -1;
                } else
                    return 0;
            }
        })
    }

    _createButton(output){
        var div = document.createElement('div');
        div.className += 'hide-block';
    
        var button = document.createElement('button');
        button.type = 'button';
        button.className += 'hide btn btn-secondary btn-sm';
        button.id = 'button_for_' + output.id;
        button.innerText = 'hide';

        div.appendChild(button);
        output.appendChild(div);
       
        this.buttons_to_outputs[button.id] = output.id;

        button.onclick = function(){
            output.parentNode.removeChild(output);
        }
    }

    _generateOutput(obj, form_id){
        var output_value = JSON.stringify(obj, null, 4);
        var form = document.getElementById(form_id);
        if(!form.children[form.children.length-1].classList.contains("output")){
            var div = document.createElement('div');
            div.classList.add('form-group');
            div.classList.add("output");
            div.id = "div_" + form_id;


            var output_area = document.createElement("textarea");
            output_area.readOnly = true;
            output_area.rows = 10;
            output_area.value = output_value;
            output_area.classList.add("form-control");
            output_area.id = 'output_area_' + form_id;

            div.appendChild(output_area);
            form.appendChild(div);

            this._createButton(div);


        } else{
            console.log('output_value: \n'+output_value);
            console.log('in _generateOutput');
            console.log("stored: \n" + localStorage.getItem("students"));
            console.log("this: \n" + this.students);
            var output = document.getElementById('output_area_'+form_id);
            output.value = output_value;
        }
    }

    _generateAlert(form_id, alert_class, text){
        var form = document.getElementById(form_id);
        var trigger = "alert_trigger";
        if(!form.children[form.children.length-1].classList.contains(trigger)){
            var alert = document.createElement("div");
            alert.classList.add("alert");
            alert.classList.add(alert_class);
            alert.classList.add('alert-dismissable');
            alert.classList.add('fade');
            alert.classList.add('show');
            alert.classList.add(trigger);
            alert.setAttribute("role", "alert");
            //alert.innerText = text;

            var button = document.createElement("button");
            button.type="button";
            button.className +='close';
            button.setAttribute('data-dismiss', 'alert');
            button.setAttribute('aria-label', 'Close');

            var span = document.createElement("span");
            span.setAttribute("aria-hidden", "true");
            span.innerHTML ="&times;";

            button.appendChild(span);
            alert.appendChild(button);

            var p = document.createElement("p");
            p.id = 'p_in_'+form_id;
            var br = document.createElement("br");
            p.innerText = text;

            alert.appendChild(br);
            alert.appendChild(p);

            form.appendChild(alert);
        } else{
            var p = document.getElementById('p_in_'+form_id);
            p.innerText = text;
            var old_alert_class = form.lastChild.classList[1];
            form.lastChild.classList.replace(old_alert_class, alert_class)
        }
    }

    _getAverage(grades){
        var sub_average = (grades.exercices.reduce((a, b) => a+b)/grades.exercices.length + 
                            grades.lecture.reduce((a, b) => a+b)/grades.lecture.length)/2;
        return sub_average;
    }

    getStudentList(student_list){
        return this._sortByName(student_list);
    }

    getStudentListForCourse(student_list, year, course_name){
        let filtered_list = student_list.filter(obj => 'courses' in obj  && 
                                                obj['courses'] && year in obj['courses'] && 
                                                course_name in obj['courses'][year]);
        return this._sortByName(filtered_list);
    }

    getAvarageForStudentInYear(studentObj, year){
        var subjects = studentObj["courses"][year];
        var average = 0;
        for (var subject in subjects){
            if (subjects.hasOwnProperty(subject)){
                var grades = subjects[subject]["grades"];
                var sub_average = this._getAverage(grades);
                average +=sub_average;       
            }
        }
        average /= Object.keys(subjects).length;
        return average;
    }

    getAvarageForStudentAllYears(studentObj){
        var courses = studentObj.courses;
        var average = 0;
        for (var year in courses){
            if (courses.hasOwnProperty(year)){
                average += this.getAvarageForStudentInYear(studentObj, year)
            }
        }
        average /= Object.keys(courses).length;
        return average;
    }

    getAverageForCourse(student_list, year, course_name){
        var average = 0;
        for(var student in this.getStudentListForCourse(student_list, year, course_name)){
            var grades = student_list[student].courses[year][course_name].grades;
            var sub_average = this._getAverage(grades);
            average +=sub_average;
        }
        average /= student_list.length;
        return average;
    }

    _addToStorage(){
        try{
            var f_name = document.getElementById("first_name").value;
            var l_name = document.getElementById("last_name").value;
            var b_date = document.getElementById("birth_date").value;
            var year = document.getElementById("year").value;
            var courses = document.getElementById("text-area-student").value;
            var students = JSON.parse(localStorage.getItem("students"));
            
            students.push({
                "first_name": f_name,
                "last_name": l_name,
                "birth_date": b_date,
                "year_of_study": year,
                "courses": courses?JSON.parse(courses):""
            });
        
            localStorage.setItem("students", JSON.stringify(students));

            this._generateOutput(students[students.length - 1], "add-student");
        }catch(e){
            window.alert(e)
        }
    }

    _getAllStudents(){
        var students = this._sortByName(JSON.parse(localStorage.getItem("students")));
        this._generateOutput(students, "get-all");
    }

    _getForCourse(){
        var course_name = document.getElementById("course_name").value;
        var course_year = document.getElementById("course_year").value;
        if(!course_name || !course_year){
            this._generateAlert("find-for-course", "alert-danger", "All fields are required");
        } else {
            var students = this.getStudentListForCourse(JSON.parse(localStorage.getItem("students")), 
                                                    course_year, course_name);
            this._generateOutput(students, "find-for-course");
        }
    }

    findStudent(f_name, l_name){
        var students = JSON.parse(localStorage.getItem("students"));
        return students.filter(obj => obj['first_name'] == f_name && obj['last_name'] == l_name)[0];
    }
    _getAverageForStudentInYear(){
        var f_name = document.getElementById("student_f_name").value;
        var l_name = document.getElementById("student_l_name").value;
        var year = document.getElementById("student_year").value;

        if(!f_name || !l_name || !year){
            this._generateAlert("average-for-student-in-year", "alert-danger", "All fields are required");
        } else {

            var student = this.findStudent(f_name, l_name);
            if(!student){
                this._generateAlert("average-for-student-in-year", "alert-info", "There is no such student");
            } else {

                var average = this.getAvarageForStudentInYear(student, year)
                this._generateAlert("average-for-student-in-year", "alert-success", "Average: "+average);
            }
        }
    }

    _getAverageForStudentAllYears(){
        var f_name = document.getElementById("f_name_all").value;
        var l_name = document.getElementById("l_name_all").value;

        if(!f_name || !l_name){
            this._generateAlert("average-for-student-all-years", "alert-danger", "All fields are required");
        } else {
            var student = this.findStudent(f_name, l_name);
            if(!student){
                this._generateAlert("average-for-student-all-years", "alert-info", "There is no such student");
            } else{
                var average = this.getAvarageForStudentAllYears(student);
                this._generateAlert("average-for-student-all-years", "alert-success", "Average: "+average);
            }
        }
    }

    _getAverageForCourse(){
        var course_name = document.getElementById("c_name").value;
        var course_year = document.getElementById("c_year").value;

        if(!course_name || !course_year){
            this._generateAlert("average-for-course", "alert-danger", "All fields are required");
        } else {
            var students = this.getStudentListForCourse(JSON.parse(localStorage.getItem("students")), course_year, course_name);
            if(typeof students == 'undefined' || students.length == 0){
                this._generateAlert("average-for-course", "alert-info", "There is no coresponding students for a given course");
            } else {
                var average = this.getAverageForCourse(students, course_year, course_name);
                this._generateAlert("average-for-course", "alert-success", "Average: "+average);
            }
        }
    }

    _deleteAllStudents(){
        
        $("div[name='delete-modal']").modal();
        var del_btn_conf = document.getElementsByName("delete-confirm")[0];
        var del_btn_close = document.getElementsByName("delete-close")[0];

        var _genAlert =  this._generateAlert;
        del_btn_conf.onclick = function() {
            localStorage.setItem("students", JSON.stringify([]));
            $("div[name='delete-modal']").modal("hide");
            _genAlert("delete-all", "alert-success", "All students were successfully deleted");
        }

        del_btn_close.onclick = function(){
            $("div[name='delete-modal']").modal("hide");
        }

        
    }
}

let help = new Helper();


var obj = {
    "first_name": "A",
    "last_name": "C",
    "birth_date": "29 AUG 1990",
    "year_of_study": "2",
    'courses':{
    "2013": {
        "AlgorithmsI": {
            "grades": {
                "exercices": [
                    2,
                    4
                ],
                "lecture": [
                    2,
                    5
                ]
            }
        },
        "BasicPhysicsI": {
            "grades": {
                "exercices": [
                    4
                ],
                "lecture": [
                    5
                ]
            }
        },
        "ProgrammingI": {
            "grades": {
                "exercices": [
                    4.5
                ],
                "lecture": [
                    2,
                    3.5
                ]
            }
        }
    }
}
    
}

var obj1 = {
    "first_name": "A",
    "last_name": "C",
    "birth_date": "29 AUG 1990",
    "year_of_study": "2",
    "courses": {
        "2013": {
            "AlgorithmsI": {
                "grades": {
                    "exercices": [
                        2,
                        4
                    ],
                    "lecture": [
                        2,
                        5
                    ]
                }
            },
            "BasicPhysicsI": {
                "grades": {
                    "exercices": [
                        4
                    ],
                    "lecture": [
                        5
                    ]
                }
            },
            "ProgrammingI": {
                "grades": {
                    "exercices": [
                        4.5
                    ],
                    "lecture": [
                        2,
                        3.5
                    ]
                }
            }
        },
        "2014": {
            "ProgrammingII": {
                "grades": {
                    "exercices": [
                        5
                    ],
                    "lecture": [
                        5
                    ]
                }
            },
            "BasicPhysicsII": {
                "grades": {
                    "exercices": [
                        5
                    ],
                    "lecture": [
                        5
                    ]
                }
            },
            "AlgorithmsII": {
                "grades": {
                    "exercices": [
                        5
                    ],
                    "lecture": [
                        5
                    ]
                }
            }
        }
    }
    
}

var obj2 = {
    "first_name": "A",
    "last_name": "A",
    "birth_date": "29 AUG 1990",
    "year_of_study": "2",
    
}
var array = [obj, obj1, obj2]
console.log(help.getStudentList(array));
console.log(help.getStudentListForCourse(array, 2013, 'AlgorithmsI'));
console.log(help.getAvarageForStudentInYear(obj, 2013));
console.log(help.getAvarageForStudentAllYears(obj1));
console.log(help.getAverageForCourse([obj, obj1], 2013, 'AlgorithmsI'));
console.log(help.students)

