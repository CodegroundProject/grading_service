var express = require('express');
var router = express.Router();

var axios = require("axios")
var sendResponse = require("../Utils").sendResponse
var fastestStrategy = require("../Utils").fastestStrategy;
var mostOptimizedStrategy = require("../Utils").mostOptimizedStrategy;
var numberOfTestPassedStrategy = require("../Utils").numberOfTestPassedStrategy;
/* GET home page. */
router.post('/api/submit', function(req, res, next) {
    const rce_request_body={
      code : req.body.code,
      lang : req.body.language
    }

    const strategyToUse = req.body.strategy
    const secondsLeft= req.body.secondsLeft

    const rce_request_options = {
        // Pour athentification
        // Authorization: `Bearer ${localStorage.getItem("gacela-token")}`,
        // pour specifier le format de reponse
        headers : { "Content-Type": "application/json"}
    };

    axios.post(process.env.RCE_ENDPOINT+'/api/rce'  , {
        "code" : "def add_(a,b):\r\n    return a+b;",
        "lang" : "python"
    } )
        .then(resp=>{
    //         resp={
    //             test_results : [
    //                 {
    //                     test_id : 1,
    //                     status : "passed",
    //                     time : 0.2
    //                 },
    //                 {
    //                     test_id : 2,
    //                     status : "failed",
    //                     time : 0.5
    //                 },
    //                 {
    //                     test_id : 3,
    //                     status : "passed",
    //                     time : 0.7
    //                 },
    //
    //             ]
    //         }
            let TheResultedScore;
            switch (strategyToUse){
                case "FASTEST":
                    TheResultedScore=fastestStrategy({testResults : resp["test_results"] , timeLeft : secondsLeft})
                    break;
                case "OPTIMIZED":
                    TheResultedScore=mostOptimizedStrategy({testResults :resp["test_results"] })
                    break;
                case "SUCCESS_RATIO":
                    TheResultedScore= numberOfTestPassedStrategy({testResults :resp["test_results"] })
                    break;
                default :
                    throw new Error("UNKNOWN Test STRATEGY !");
            }

            sendResponse(res , 200 , true , {score : TheResultedScore , calculatedAt : new Date()} )
        })
        .catch(err=>{
            console.log("ERROR =", err);
            sendResponse(res , 500 , false , err.message)
        })


});

module.exports = router;
