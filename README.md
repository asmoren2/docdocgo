# docdocgo
doctor - patient management system

Author: Adolfo Moreno

Main Technologies Used:
Node.js, ExpressJS, Passport, Mongoose, Bootstrap.

System uses ExpressJS, Bootstrap to render the applications pages using views and MVC. Passport handles login.

MongoDB database uses 3 collections users, appointments, files.

These views are rendered using the POST and GET http actions where we retrieve the view using the GET command and send any additional information to the pages and our Database using the POST command. These actions can be found in the routes file.

The code is structured in a way that after the initial pages i.e. index and login the user is directed to their particular home page either "dashboard" for doctors or "profile" for patients.

In the dashboard doctors are immediately greated by the dashboard and shown a list of all the patients as well as a search bar where they can search by the last name. If the doctor clicks on a patients name the are redirected to that patients page where they will see all their information icluding name, dob, phone etc. as well as upcoming appointments, past appointments and pending appointments which the doctor has the ability to decline and write a meaasage why. The doctor can also create a new appointment with the patient on this patient page. Doctor's also have the ability to add and view files attached to the user.

On the profile side when a patient logs in they are immediately shown their infomation like what is displayed on the dashboard for doctors with the exception being that they can cancel future appointments and view denied appointments.


Planned future modifications:
Ability to message,
Migrate to parse server or firebase,
create a cleaner whole layout, 
refactor code, 
add ability to search by any type of method,
provide the ability to upload large files using gridfs.
...............

