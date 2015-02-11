'use strict';

/* Controllers */

var refreshSvc;
var refreshComments;

angular.module('myApp.controllers', [])

  .controller('LoginCtrl', ['$scope', '$http', '$location', 'LoginService', 'Auth', 'Storage', function ($scope, $http, $location, LoginService, Auth, Storage) {	  
      $scope.userInfo  = [];	  	  
      $scope.login = function (email, phone) {
		   //phone=parseInt(phone);
		  phone=phone.replace("(", ""); 
		  phone=phone.replace(")", ""); 
		  phone=phone.replace(".", ""); 
		  phone=phone.replace(".", ""); 
		  phone=phone.replace(/-/g, ""); 
		  phone=phone.replace(/\\/g, "");
		  phone = phone.replace(/\//g, "");

		   console.log("calling login for " + email + " and " + phone);
			LoginService.verifyLogin(email, phone, 1)
		  	.success(function (result) {
						if (result) {							
							//we found someone
							//UserService.setUserInfo(result);		
							$scope.userInfo=angular.fromJson(result);
							console.log("result:" + result);
							Auth.setUser($scope.userInfo.empID,$scope.userInfo.empName,$scope.userInfo.emailAddress,$scope.userInfo.userType);
							Storage.addLocalStorage("userID",$scope.userInfo.empID);
							Storage.addLocalStorage("emailAddress",$scope.userInfo.emailAddress);
							Storage.addLocalStorage("empName",$scope.userInfo.empName);
							
	 				    	console.log("user authenticated "+ $scope.userInfo.empID + " " + $scope.userInfo.empName);							
							$location.path('/home');
							//addLocalStorage(UserID, result);
							
						}
						else {
							//userInfo.isLogged = false;
							//userInfo.username = '';
							//userInfo.empID='';
							Auth.setUser('');
							console.log("user not found");
							$scope.output = "User not found.";
						}

					})
				.error(function (e) {		
					Auth.setUser('');
				    console.log("ERROR calling login for " + email + " and " + empID);
		          	$scope.output = "Error logging in";

				});
	
      }
  } ])

	.controller('HomeCtrl', ['$scope', function ($scope) {

	} ])

	//.controller('LibraryCtrl', ['$scope', 'ContentService', '$timeout', function ($scope, ContentService, $timeout) {
	 .controller('CameraCtrl', ['$scope', 'CameraService', '$interval', '$http', function ($scope, CameraService, $interval, $http) {
		 
	 }])
	
	

	.controller('AgendaCtrl', ['$scope', 'AgendaService', '$interval', '$http','$filter', 'Storage',function($scope, AgendaService,$interval,$http,$filter,Storage) {

	    $scope.agendaItems = [];
	    $scope.programID = 1; // default program id for sales univ
//	    $scope.strSearch = "";
		var dt=new Date();
		var agendaDt;
		
		var userID=Storage.getLocalStorage("userID");
		var maxDt = new Date("May 1, 2015 00:00:00");
		var minDt=new Date("April 27, 2015 00:00:00");

console.log("Min date is " + minDt);
console.log("Max date is " + maxDt);
				
//		alert(dt + ' ' + dt.getMonth());
//		SET INITIAL DATE						
		if (dt <= minDt) {
			//go to Monday
			dt = new Date(minDt);
		}
		if (dt >= maxDt) {
			//go to Friday
			dt = new Date(maxDt);
		}
	console.log("Current Date set to " + dt);

//	$scope.setCalendarDates(dt);


//$scope.setCalendarDates = function (varDt) {
	
	console.log("changing date to " + dt);
	
	
		var varDt1 =  new Date(minDt);
		varDt1.setDate(minDt.getDate());
		var varDt2= new Date(minDt);
		varDt2.setDate(minDt.getDate()+1);
		var varDt3 = new Date(minDt);
		varDt3.setDate(minDt.getDate() + 2);
		var varDt4 = new Date(minDt);
		varDt4.setDate(minDt.getDate() + 3);
		var varDt5 = new Date(minDt);
		varDt5.setDate(minDt.getDate() + 4);
//		varDt1.setDate(dt.getDate() +  (1-dt.getDay()));
//		varDt2.setDate(dt.getDate() + (2-dt.getDay()));
//		varDt3.setDate(dt.getDate() + (3-dt.getDay()));
//		varDt4.setDate(dt.getDate() + (4-dt.getDay()));
//		varDt5.setDate(dt.getDate() + (5-dt.getDay()));
		$scope.dtMon= varDt1;
		$scope.dtTues = varDt2;
		$scope.dtWed= varDt3;
		$scope.dtThurs = varDt4;
		$scope.dtFri = varDt5;
					
	//console.writeline($scope.dtFri);
					
		var wkdays = ["Sun", "Mon", "Tu","Wed","Th","Fri","Sat"];
		var months = [ "Jan", "February", "Mar", "Apr", "May", "Jun", 
               "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];

		$scope.mon = months[varDt1.getMonth()] + " " + varDt1.getDate();
		$scope.tues = months[varDt2.getMonth()]+ " " + varDt2.getDate();
		$scope.wed = months[varDt3.getMonth()] +  " " + varDt3.getDate();
		$scope.thurs = months[varDt4.getMonth()] +  " " + varDt4.getDate();
		$scope.fri = months[varDt5.getMonth()] +  " " + varDt5.getDate();

		agendaDt= $filter('date')(dt,'yyyy-MM-dd');		
		

AgendaService.listAgenda(1, agendaDt, userID)
			.success(function (result) {
			    $scope.agendaItems = result;
			    console.log("showing agenda content - " + result[1]);
			})
			.error(function (e) {
			    console.log("ERROR calling listAgenda for " + agendaDt);
			});

	$scope.refreshAgendaService(1,agendaDt,userID);

	$scope.refreshAgendaService = function(programid, date, empid) {
//    function refreshAgendaService(programid, date, empid) {
			$interval.cancel(refreshSvc);
			$interval.cancel(refreshComments);
			dt=date;
			date = $filter('date')(date,'yyyy-MM-dd');
			listAgenda(programid, date, empid);
			console.log("showing agenda for " + date + " " + empid);
			 refreshSvc=$interval (function () {
		    console.log("showing agenda every 120 sec");
			listAgenda(programid, date, empid);
			}, 120000);
	}

	    //May need: theArray = angular.fromJson(result);
	  function listAgenda(programid,agendadate, empid) {
//	    $scope.listPosts = function(programid, empid, parentid) {
			 AgendaService.listAgenda(programid, agendadate, empid)
			.success(function (result) {
			    $scope.agendaItems = result;
			    console.log("called listAgenda for " + programid + " and " + empid + " and " + agendadate);
			})
			.error(function (e) {
			    console.log("ERROR calling listAgenda  for " + programid + " and " + empid);
			});
		}
	
	}])

	.controller('AgendaPreseasonCtrl', ['$scope', 'AgendaPreseasonService', '$interval', '$http','$filter', 'Storage',function($scope, AgendaPreseasonService,$interval,$http,$filter,Storage) {

	    $scope.agendaItems = [];
	    $scope.programID = 1; // default program id for sales univ
//	    $scope.strSearch = "";
		var dt=new Date();
		var agendaDt;
		
		var userID=Storage.getLocalStorage("userID");
		
		var wks=[];
		 var wkStartDate=[];
		 var wkEndDate=[];

		wks[1]='Week 1, March 9th-13th';
		wks[2]='Week 2, March 16th-20th';
		wks[3]='Week 3, March 23rd-27th';
		wks[4]='Week 4, March 30th-April3rd';
		wks[5]='Week 5, April 6th-10th';
		wks[6]='Week 6, April 13th-17th';
		wks[7]='Week 7, April 20th-24th';
		wks[8]='Week 8, April 27th-May 1st';

		wkStartDate[1]=new Date('3/9/2015');
		wkStartDate[2]=new Date('3/16/2015');
		wkStartDate[3]=new Date('3/23/2015');
		wkStartDate[4]=new Date('3/30/2015');
		wkStartDate[5]=new Date('4/6/2015');
		wkStartDate[6]=new Date('4/13/2015');
		wkStartDate[7]=new Date('4/20/2015');
		wkStartDate[8]=new Date('4/27/2015');
		
		wkEndDate[1]=new Date('3/17/2015');
		wkEndDate[2]=new Date('3/24/2015');
		wkEndDate[3]=new Date('3/31/2015');
		wkEndDate[4]=new Date('4/7/2015');
		wkEndDate[5]=new Date('4/14/2015');
		wkEndDate[6]=new Date('4/21/2015');
		wkEndDate[7]=new Date('4/28/2015');
		wkEndDate[8]=new Date('5/2/2015');
				
	console.log("Current Date set to " + dt);
	
		agendaDt= $filter('date')(dt,'yyyy-MM-dd');				

AgendaPreseasonService.listAgendaPreseason(1, userID)
			.success(function (result) {
			    $scope.agendaItems = result;
			    console.log("showing agenda content - ");	
			})
			.error(function (e) {
			    console.log("ERROR calling listPreseasonAgenda for " + agendaDt);
			});

//$scope.refreshAgendaService(1,agendaDt,userID);

//	$scope.refreshAgendaService = function(programid,empid) {
//			$interval.cancel(refreshSvc);
//			$interval.cancel(refreshComments);
////			dt=date;
////			date = $filter('date')(date,'yyyy-MM-dd');
//			listAgendaPreseason(programid, empid);
//			console.log("showing preseason agenda  " + empid);
//			 refreshSvc=$interval (function () {
//		    console.log("showing agenda every 120 sec");
//			listAgendaPreseason(programid, empid);
//			}, 120000);
//	}

$scope.selectWeek=function(paramDt) {
			var eventDt;
			eventDt=new Date(paramDt);		
//			eventDt.setDate(eventDt);
			console.log("getting week for date: " & eventDt);
			var i=1;
			while (i <= 9) {			
				if (eventDt >= wkStartDate[i] && eventDt < wkEndDate[i]) {
					return wks[i];
				}
				i++;
			}
		}
/*		
function Ctrl($scope) {
	    $scope.$watch('wk', function(newValue, oldValue) {
	        console.log('newValue: ' + newValue + ', oldValue: '+ oldValue);
    	    if (newValue !== oldValue) {
            //...
        	}
    	}
}
*/
		
		
	    //May need: theArray = angular.fromJson(result);
	  function listAgendaPreseason(programid, empid) {
//	    $scope.listPosts = function(programid, empid, parentid) {
			 AgendaPreseasonService.listAgendaPreseason(programid, empid)
			.success(function (result) {
			    $scope.agendaItems = result;
			    console.log("called listAgendaPreseason for " + programid + " and " + empid);
			})
			.error(function (e) {
			    console.log("ERROR calling listAgendaPreseason  for " + programid + " and " + empid);
			});
		}
	
	}])

	.controller('MenuCtrl', ['$scope', '$http', '$interval', 'MenuService', 'Storage', function ($scope, $http,  $interval, MenuService, Storage) {	  
		var userID=Storage.getLocalStorage("userID");
		var refreshMenu;
		$scope.newAnnouncements=0;
		
		function listNewAnnouncements(programid,userID) {
			MenuService.selectNewAnnouncements(1,userID) 
			.success(function (result) {
			    $scope.newAnnouncements = result;
			    console.log("called selectnewannouncements for " + userID );
			})
			.error(function (e) {
			    console.log("ERROR calling selectNewAnnouncements  for  " + userID);
			})
		}
				
		MenuService.selectNewAnnouncements(1,userID) 
		.success(function (result) {
			    $scope.newAnnouncements = result;
				refreshMenuService();
			    console.log("called selectnewannouncements for " + userID );
			})
			.error(function (e) {
			    console.log("ERROR calling selectNewAnnouncements  for  " + userID);
			});
			
		function refreshMenuService() {
			 $interval.cancel(refreshMenu);
			 refreshMenu=$interval (function () {
		     console.log("showing updated menu every 60 sec");
			listNewAnnouncements(1,userID);
			}, 60000);
	}
	}])


	// Controller for Players and Coaches Pages.
	.controller('PersonCtrl', ['$scope', 'PersonService', '$interval', '$http', 'Storage', function($scope, PersonService, $interval, $http, Storage) {
		
	    $scope.playercard = [];
		$scope.players = [];
		$scope.coaches = [];
	    $scope.programID = 1; // default program id for sales univ
		
		var userID = Storage.getLocalStorage("userID");

		// Grab list of players.
		PersonService.listPlayers(1,userID)
			.success(function (result) {
			    $scope.players = result;
			    console.log("showing content");
				
			})
			.error(function (e) {
			    console.log("ERROR calling listPlayers");
			});
		
		// Grab list of coaches.
		PersonService.listCoaches(1,userID)
			.success(function (result) {
			    $scope.coaches = result;
			    console.log("showing content");
				
			})
			.error(function (e) {
			    console.log("ERROR calling listCoaches");
			});
	}])
	
	// Controller for Player Card.
	.controller('PersonCardCtrl', ['$scope', 'CardService', '$interval', '$http', 'Storage', function($scope, CardService, $interval, $http, Storage) {
		
	    $scope.playercard = [];
	    $scope.programID = 1; // default program id for sales university
		
		var userID = Storage.getLocalStorage("userID");

		// Grab player card info.
		CardService.listPlayerCard(userID,1,userID)
			.success(function (result) {
			    $scope.playercard = result;
			    console.log("showing content");
				
			})
			.error(function (e) {
			    console.log("ERROR calling listPlayerCard");
			});			
	}])
	
	.controller('AnnouncementsCtrl', ['$scope', 'AnnouncementService', '$interval', '$http', 'Storage', function($scope, AnnouncementService,$interval,$http,Storage) {

	    $scope.announcements = [];
	    $scope.programID = 1; // default program id for sales univ
//	    $scope.strSearch = "";
		var refreshAnnouncements;
		var userID=Storage.getLocalStorage("userID")
		
AnnouncementService.markAnnouncementsRead(1,userID);

AnnouncementService.listAnnouncements(1,userID)
			.success(function (result) {
			    $scope.announcements = result;
			    console.log("showing content");
				
			})
			.error(function (e) {
			    console.log("ERROR calling listAnnouncements");
			});

refreshService();

    function refreshService() {
			 $interval.cancel(refreshSvc);
			 $interval.cancel(refreshComments);
			 refreshSvc=$interval (function () {
			var now = new Date;
		    console.log("showing announcements every 60 sec");
			listAnnouncements(1,userID);
			}, 60000);
	}

	    //May need: theArray = angular.fromJson(result);
	  function listAnnouncements(programid,empid) {
			 AnnouncementService.listAnnouncements(programid,empid)
			.success(function (result) {
			    $scope.announcements = result;
			    console.log("called listAnnouncements for " + programid + " and " + empid);
			})
			.error(function (e) {
			    console.log("ERROR calling listAnnouncements  for " + programid + " and " + empid);
			});
		}
	
	}])


	.controller('EventCtrl', ['$scope', 'EventService',  '$http', 'Storage', function($scope, EventService,$http, Storage) {

	    $scope.eventDetails = [];
	    $scope.programID = 1; // default program id for sales univ
//	    $scope.strSearch = "";
		var userID=Storage.getLocalStorage("userID")
		
EventService.listEventDetails(1,userID)
			.success(function (result) {
			    $scope.eventDetails = result;
			    console.log("showing event details");
				console.log(result);
			})
			.error(function (e) {
			    console.log("ERROR calling listEventDetails");
			});
	
	}])

	.controller('FollowingFeedCtrl', ['$scope', 'FeedService', '$interval', '$http', 'Storage', function ($scope, FeedService, $interval, $http, Storage) {
		$scope.followingPosts=[];
		$scope.comments = [];
	    $scope.currentID = 0; // default topic id
	    $scope.strSearch = "";
	    $scope.currentFeed = null;

		var userID=Storage.getLocalStorage("userID");
		
		FeedService.listFollowingPosts(1,userID,0)
			.success(function (result) {
			    $scope.followingPosts = result;
			    console.log("showing following posts");
				//console.log("showing refresh service for following.");
				//refreshFollowingService();
			})
			.error(function (e) {
			    console.log("ERROR calling listFollowing");
			});

		refreshFollowingService();
		
    function refreshFollowingService() {
			$interval.cancel(refreshSvc);
			refreshSvc=$interval (function () {
			var now = new Date;
		    console.log("showing following content every 120 sec");
			listFollowingPosts(1,userID,0);
			}, 120000);
	}


	  function listFollowingPosts(programid,empid,parentid) {
			 FeedService.listFollowingPosts(programid,empid,parentid)
			.success(function (result) {
			    $scope.followingPosts = result;
			    console.log("called listFollowingPosts");
			})
			.error(function (e) {
			    console.log("ERROR calling listFollowingPosts");
			});
		}
		
	$scope.updateUserAccess = function (username, contentid) {
	        if (username != '' && contentid > 0) {
	            //log local storage for access to content
	            ContentService.updateUserAccess(username, contentid)
                .success(function (result) {
                    //this was a success
                    console.log("Success in updating user access.");
                })
                .error(function (e) {
                    console.log("ERROR calling updateUserAccess");
                });
	        }
	        else {
	            console.log("couldn't all because of username " + username + " and contentid " + contentid);
	        }
	    }
		
		function listComments(postID) {
	        $scope.currentID = postID;
	        FeedService.listComments(postID)
				.success(function (result) {
				    $scope.comments = result;
				})
				.error(function (e) {
				    console.log("ERROR calling listComments");
				});
	    }

	
	    $scope.getComments = function (postID) {
		    console.log("refreshing post " + postID);
			listComments (postID);
			$interval.cancel(refreshComments);
			refreshComments=$interval (function () {
				var now = new Date;
				console.log("checking for comments every 120 seconds for post " + postID + " currently " + now);
				listComments (postID);
			} , 120000);
		}

	    $scope.putUserAccess = function (postID) {
	        FeedService.putUserAccess(postID, userID)
                .success(function (result) {
                    console.log("successfully posted tracking to " + postID + " - " + userID);
                })
                .error(function (e) {
                    console.log("ERROR posting activity tracking for " + postID + " - " + userID);
                })
	    }

	    $scope.showImage = function (imgExists) {
	        if (imgExists.toString == '0' || imgExists.toString == 'false') {
	            return false;
	        }
	        else {
	            return true;
	        }
	    }
	    $scope.flagLike = function (postID, like) {
	        console.log("we are flagging like " + like + " for " + userID);
	        FeedService.flagLike(postID, userID, like)
			.success(function (result) {
			    listPosts(1, userID, 0);
			    console.log("Success in adding like." + postID + ' ' + userID + ' ' + like);
			})
			.error(function (e) {
			    console.log("ERROR flagging like.");
			})
	    }

	    $scope.addComment = function (postID, commentText) {
	        commentText = commentText.replace(".", "pppp");
	        commentText = commentText.replace("?", "qqqq");
	        commentText = encodeURIComponent(commentText);
	        console.log("we are adding the comment now." + commentText);
	        FeedService.addComment(postID, commentText, userID)
                    .success(function (result) {
                        console.log("Success in adding comment");
                        listComments(postID);
                        $scope.commentText = '';
                    })
            .error(function (e) {
                console.log("ERROR calling add comment" + e);
            });
	    }


	}])
	
	 .controller('FeedCtrl', ['$scope', 'FeedService', '$interval', '$http', 'Storage', '$rootScope', function ($scope, FeedService, $interval, $http, Storage, $rootScope) {

	     $scope.posts = [];
	     $scope.comments = [];
	     $scope.currentID = 0; // default topic id
	     $scope.strSearch = "";
	     $scope.currentFeed = null;
	     //	    var uploadUrl="http://uhcsalesdev.uhc.com/uploadFile.aspx";
		
	     var userID=Storage.getLocalStorage("userID")
		
	     FeedService.listPosts(1,userID,0)
             .success(function (result) {
                 $scope.posts = result;
                 console.log("showing post content for " + Storage.getLocalStorage("userID") + " " + Storage.getLocalStorage("empName"));
             })
             .error(function (e) {
                 console.log("ERROR calling listPosts");
             });

	     refreshService();

	     function refreshService() {
	         $interval.cancel(refreshSvc);
	         refreshSvc=$interval (function () {
	             var now = new Date;
	             console.log("showing post content every 60 sec");
	             listPosts(1,userID,0);
	         }, 60000);
	     }

	     //May need: theArray = angular.fromJson(result);
	     function listPosts(programid,empid,parentid) {
	         //	    $scope.listPosts = function(programid, empid, parentid) {
	         FeedService.listPosts(programid,empid,parentid)
			.success(function (result) {
			    $scope.posts = result;
			    console.log("called listPosts");
			})
			.error(function (e) {
			    console.log("ERROR calling listPosts");
			});
	     }

	     function listComments(postID) {
	         //	    $scope.listComments = function (postID) {
	         $scope.currentID = postID;
	         FeedService.listComments(postID)
                 .success(function (result) {
                     $scope.comments = result;
                 })
                 .error(function (e) {
                     console.log("ERROR calling listComments");
                 });
	     }

	
	     $scope.getComments = function (postID) {
	         console.log("refreshing post " + postID);
	         listComments (postID);
	         $interval.cancel(refreshComments);
	         refreshComments=$interval (function () {
	             var now = new Date;
	             console.log("checking for comments every 60 seconds for post " + postID + " currently " + now);
	             listComments (postID);
	         } , 60000);
	     }

	     $scope.putUserAccess = function(postID) {
	         FeedService.putUserAccess (postID, userID)
                 .success (function(result) {
                     console.log("successfully posted tracking to " + postID + " - " + userID);
                 })
                 .error (function(e) {
                     console.log("ERROR posting activity tracking for " + postID + " - " + userID);
                 })
	     }

	     $scope.showImage = function (imgExists) {
	         if (imgExists.toString == '0' || imgExists.toString == 'false') {
	             return false;
		    }
		    else {
	             return true;
		    }
		}
		$scope.flagLike = function(postID, like) {
			console.log("we are flagging like " + like + " for " + userID);
			FeedService.flagLike(postID, userID, like)
			.success(function(result) {
					listPosts(1, userID,0);
					console.log("Success in adding like." + postID + ' ' + userID + ' ' + like);
			})
			.error (function(e) {
					console.log("ERROR flagging like.");
			})
		}

		$scope.addComment = function(postID,commentText) {
				commentText=commentText.replace(".","pppp");
				commentText=commentText.replace("?","qqqq");
				commentText=encodeURIComponent(commentText);
				console.log("we are adding the comment now." + commentText);
				FeedService.addComment(postID,commentText,userID)
						.success(function(result) {
							console.log("Success in adding comment");
							listComments(postID);
							$scope.commentText='';
						})
                .error(function (e) {
                    console.log("ERROR calling add comment" + e);
                });
		}
		
		$scope.addPost =  function (activityText) {
			//imgname="";
			activityText=activityText.replace(".", "pppp");			
			activityText=activityText.replace("?", "qqqq");
			activityText=encodeURIComponent(activityText);
			var ext;
			if (typeof frmPost.fileImg.files[0] != "undefined") {
				var fileName=frmPost.fileImg.files[0].name;
				ext = fileName.substr(fileName.lastIndexOf('.') + 1);
				ext = ext.toLowerCase()
				if (ext != "jpg" && ext !="peg" && ext !="gif" && ext != "png" && ext !="bmp") {
					console.log(ext + " is NOT a valid image");
					alert(ext + " is NOT a valid image.");
					return;
				}
			}
			if (typeof frmPost.fileImg.files[0] == "undefined")  {
				ext="0";
			}
			FeedService.addPost(1,activityText, ext, userID)
			.success(function (result) {
                    //this was a success		
					console.log(result);
					if (typeof frmPost.fileImg.files[0] !== "undefined") {
						$scope.uploadFile(result,'feed');					
					}
		            console.log("Success in adding post.");
		            resetForm();
		            refreshService();
					window.location="#/feed"
			    //listPosts(1, userID, 0);
					refreshService();

                })
                .error(function (e) {
                    console.log("ERROR calling add post for values 1-" + activityText + "-" + ext + "-" + userID);
                });
									

	     }


	$scope.uploadFile = function(id,tp) {
	//var fileName=$scope.fileImg.files[0].name;
	var fileName=frmPost.fileImg.files[0].name;
	//var fileName = files[0].name;
	var uploadURL = $rootScope.uploadURL;
    console.log("We're working on uploading now.")
    var ext = fileName.substr(fileName.lastIndexOf('.') + 1);
    ext = ext.toLowerCase();
	if (ext != "jpg" && ext != "peg" && ext !="jpeg" && ext !="gif" && ext != "png" && ext !="bmp") {
		console.log(ext + " is not a valid image");
		alert(ext + " is not a valid image.");
		return;
	}
	fileName= tp + id + "." + ext
    var fd = new FormData();    
   // fd.append("file", files[0]);
    fd.append("file", frmPost.fileImg.files[0]);
    console.log(uploadURL + "?ext=" + ext + "&id=" + id + "&user=" + userID + "&post=");

    uploadURL = uploadURL + "?ext=" + ext + "&id=" + id + "&user=" + userID + "&post=";
    	$http.post(uploadURL, fd, {
        withCredentials: true,
        headers: {'Content-Type': undefined },
        transformRequest: angular.identity
    })
    .success(function (result) {
	console.log("uploaded successfully");
	} )
    .error(function (result) {
	console.log("error" + result);
	})
};
		 
	    $scope.searchPosts = function (strSearch) {
	        $scope.currentID = 0;
	        $scope.strSearch = strSearch;						
	        FeedService.searchPosts(strSearch, 1, 0)
	        .success(function (result) {
	            $scope.posts = result;
	        })
    	    .error(function (e) {
    	        console.log("ERROR calling searchContent");
    	    });
	    }

	    $scope.updateUserAccess = function (username, contentid) {
	        if (username != '' && contentid > 0) {
	            //log local storage for access to content
	            ContentService.updateUserAccess(username, contentid)
                .success(function (result) {
                    //this was a success
                    console.log("Success in updating user access.");
                })
                .error(function (e) {
                    console.log("ERROR calling updateUserAccess");
                });
	        }
	        else {
	            console.log("couldn't all because of username " + username + " and contentid " + contentid);
	        }
	    }
		
		function resetForm() {
			$scope.postText='';
			$scope.imgFile='';	
		}

	    $scope.clearSearchText = function () {
	        $scope.strSearch = '';
	        $scope.searchText = '';
	        console.log('Cleared search text');
	    }
		
function processUpload(x,f,e) {
	var fileName = "img_" + x.toString + "." + e;
	alert(filename);
    var fd = new FormData();    
    fd.append("file", f);
	uploadUrl=uploadUrl+"?empID=" + userID + "&post=" + x;
    	$http.post(uploadUrl, fd, {
        withCredentials: true,
        headers: {'Content-Type': undefined },
        transformRequest: angular.identity
    })
    .success(function (result) {
	console.log("uploaded " + fileName + " successfully");
	} )
    .error(function (result) {
	console.log("error" + result);
	})
}





	} ]);
