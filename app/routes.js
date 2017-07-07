//Autho: Adolfo Moreno
var User = require('../app/models/user');
var Appt = require('../app/models/appointment');
var upFile = require('../app/models/file');
var multer = require('multer');
var fs = require('fs');
var pathModule = require('path');

// Grab the current date
var datetime = new Date();

module.exports = function(app, passport) {

  // load our home page view
  app.get('/', function(req, res) {
    res.render('index.ejs');
  });

  // show the signup form
  app.get('/signup', function(req, res) {
    // render the page and pass in any flash data if it exists
    res.render('signup.ejs', {
      message: req.flash('signupMessage')
    });
  });

  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));


  // load our login page with forms
  app.get('/login', function(req, res) {
    res.render('login.ejs', {
      message: req.flash('loginMessage')
    });
  });

  // Load the dashboard page if the user is a doctor
  app.get('/dashboard', function(req, res) {
    User.find(function(err, users, res) {
      if (err) return res.sendStatus(500);
      // pass a list of users
      res.render('dashboard.ejs', {
        userList: users
      });
    });
  });

  // Post function for searching for a user.
  // look through the last names if found grab that user's id
  app.post('/searchPatient', function(req, res) {
    var query = User.find({
      'name.last': req.body.lastName
    }).limit(1);

    // Execute query in a callback and return user
    query.exec(function(err, user) {
      if (!err) {
        // redirect to the user's page
        res.redirect(/patient/ + user[0]._id);
      } else {
        alert('USER not found');
      }
    });
  });

  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // Load our profile section
  app.get('/profile', isLoggedIn, function(req, res) {
    var futureDates, pastDates, allDates;
    var doctors;
    // if user is doctor go to dashboard else profile
    var view = req.user.local.doctor ? 'dashboard.ejs' : 'profile.ejs';
    User.find({
      'local.doctor': false
    }, function(err, patient) {
      if (err) return handleError(err);
      // Look for future user appointments
      Appt.find({
        'appointment.date': {
          $gte: datetime
        },
        'appointment.uID': req.user._id
      }, function(err, aprt) {
        if (err) return handleError(err);
        futureDates = aprt;
        // look for past appointments
        Appt.find({
          'appointment.date': {
            $lt: datetime
          },
          'appointment.uID': req.user._id
        }, function(err, appm) {
          pastDates = appm;
        });
        // look for all user's appointments
        Appt.find({
          'appointment.uID': req.user._id
        }, function(err, aprt) {
          allDates = aprt;
        });
        // look for all doctors
        User.find({
          'local.doctor': true
        }, function(err, pat) {
          doctors = pat;
        });
        // look for all user's files
        upFile.find({
          'file.patientID': req.user._id
        }, function(err, file) {
          if (err) return handleError(err);
          // pass on all query results to the profile page
          res.render(view, {
            userList: patient,
            user: req.user,
            ment: aprt,
            appoi: pastDates,
            penDates: allDates,
            myFiles: file,
            docList: doctors
          });
        });
      })
    })
  });

  // action to delete file
  app.post('/delFile', function(req, res) {
    // Look for file based on ID and then delete
    upFile.findByIdAndRemove(req.body.apptID, function(err, todo) {
      res.redirect(req.get('referer'));
    });
  });

  // action to delete appointment
  app.post('/delAppoint', function(req, res) {
    // Look for appointment by ID and delete
    Appt.findByIdAndRemove(req.body.apptID, function(err, todo) {
      res.redirect(req.get('referer'));
    });
  });

  // load our patient/patientID view with their information
  app.get('/patient/:id', isLoggedIn, function(req, res) {
    var futureDates, pastDates;
    // Look for the user by the id grabbed from url
    User.findOne({
      '_id': req.params.id
    }, function(err, pat) {
      if (err) return handleError(err);
      // Look for that user's appointments
      Appt.find({
        'appointment.uID': req.params.id
      }, function(err, appoint) {
        if (err) return handleError(err);
        // Look for future appointments
        Appt.find({
          'appointment.date': {
            $gte: datetime
          },
          'appointment.uID': req.params.id
        }, function(err, mydate) {
          futureDates = mydate;
        });
        // Look for past appointments
        Appt.find({
          'appointment.date': {
            $lt: datetime
          },
          'appointment.uID': req.params.id
        }, function(err, mypdate) {
          pastDates = mypdate;
        });
        // Look for patient's files
        upFile.find({
          'file.patientID': req.params.id
        }, function(err, file) {
          if (err) return handleError(err);
          // Render the page view with query results
          res.render('patient.ejs', {
            userID: pat,
            appList: appoint,
            myFiles: file,
            fDates: futureDates,
            pDates: pastDates
          });
        });
      })
    })
  });

  // action to create a new appointment
  app.post('/patient/newAppoint', function(req, res, next) {
    // create new appointment object
    var apt = new Appt();

    apt.appointment.uID = req.body.patientID;
    apt.appointment.date = req.body.date;
    apt.appointment.doc = req.user._id;
    apt.appointment.subj = req.body.message;
    apt.appointment.status = "Confirmed";
    apt.appointment.message = "N/A";

    // Create a date type
    var appDate = new Date(apt.appointment.date);

    // Save to database
    apt.save(function(err, apt_Saved) {
      if (err) {
        throw err;
      } else {
        // Go back to originating page
        res.redirect(req.get('referer'));
      }
    });
  });

  // Grab the file path for uploads
  app.use(multer({
    dest: __dirname + '/file/uploads/'
  }).any());

  // Action to upload new file
  app.post('/uploadFile', function(req, res, next) {
    // Create new file object
    var newFile = new upFile();
    newFile.file.contentType = 'application/pdf';
    newFile.file.patientID = req.body.patientID;
    newFile.file.name = req.files[0].originalname;

    var readerStream = fs.createReadStream(req.files[0].path);
    var dest_file = pathModule.join(req.files[0].destination, req.files[0].originalname);
    newFile.file.data = dest_file;
    newFile.save();
    var writerStream = fs.createWriteStream(dest_file);

    var stream = readerStream.pipe(writerStream);

    stream.on('finish', function() {
      fs.unlink(req.files[0].path);
    });
    // redirect to originator
    res.redirect(req.get('referer'));
  });

  // Action to upload new file
  app.post('/patient/uploadFile', function(req, res, next) {
    var newFile = new upFile();
    newFile.file.contentType = 'application/pdf';
    newFile.file.patientID = req.body.patientID;
    newFile.file.name = req.files[0].originalname;

    var readerStream = fs.createReadStream(req.files[0].path);
    var dest_file = pathModule.join(req.files[0].destination, req.files[0].originalname);
    newFile.file.data = dest_file;
    newFile.save();
    var writerStream = fs.createWriteStream(dest_file);

    var stream = readerStream.pipe(writerStream);

    stream.on('finish', function() {
      fs.unlink(req.files[0].path);
    });
    res.redirect(req.get('referer'));
  });

  // Action to delete file
  app.post('/patient/delFile', function(req, res) {
    // Look for file and then delete
    upFile.findByIdAndRemove(req.body.apptID, function(err, todo) {
      // redirect to originator
      res.redirect(req.get('referer'));
    });
  });

  // Action to deny an appointment
  app.post('/patient/denyAppt', function(req, res) {
    // Look for appointment by ID then update status variable to denied
    Appt.findOne({
      _id: req.body.apptID
    }, function(err, user) {
      user.appointment.status = "Denied";
      user.appointment.message = req.body.message;
      user.save(function(err) {
        if (err) {
          console.error('ERROR!');
        }
        // redirect to originator
        res.redirect(req.get('referer'));
      });
    });
  });

  // Action to accept appointment
  app.post('/patient/acceptAppt', function(req, res) {
    // Look for appointment by the ID and update status to Confirmed
    Appt.findOne({
      _id: req.body.apptID
    }, function(err, user) {
      user.appointment.status = "Confirmed";

      user.save(function(err) {
        if (err) {
          console.error('ERROR!');
        }
        // redirect to originator
        res.redirect(req.get('referer'));
      });
    });
  });

  // Action for creating appointment
  app.post('/appointment', function(req, res) {
    var apt = new Appt();

    apt.appointment.uID = '5954572a1ef553c57764e555';
    apt.appointment.date = req.body.date;
    apt.appointment.doc = req.body.selectpicker;
    apt.appointment.subj = req.body.reason;
    apt.appointment.status = "Pending";
    apt.appointment.message = "N/A";

    var appDate = new Date(apt.appointment.date);

    apt.save(function(err, apt_Saved) {
      if (err) {
        throw err;
        console.log(err);
      } else {
        console.log('saved!');
        // redirect to originator
        res.redirect(req.get('referer'));
      }
    });
  });

  // Load our logout section
  app.get('/logout', function(req, res) {
    // log user out
    req.logout();
    // redirect user to home page
    res.redirect('/');
  });
};


function isLoggedIn(req, res, next) {
  // if user is logged in proceed
  if (req.isAuthenticated()) {
    return next();
  }
  // Take user to home page to register or login
  res.redirect('/');
}
