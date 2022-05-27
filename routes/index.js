var express = require('express');
var router = express.Router();

var axios = require("axios")
var sendResponse = require("../Utils").sendResponse
var fastestStrategy = require("../Utils").fastestStrategy;
var mostOptimizedStrategy = require("../Utils").mostOptimizedStrategy;
var numberOfTestPassedStrategy = require("../Utils").numberOfTestPassedStrategy;



/**
 * @swagger
 *  /api/submit:
 *    post:
 *      summary: Submits users code
 *      description: Submits users code for a specific challenge
 *      consumes:
 *        application/json
 *      produces:
 *        application/json
 *      parameters:
 *       - in: body
 *         name: body
 *         required: true
 *         description: Room payload
 *         schema:
 *          type: object
 *          properties:
 *            challenge_id:
 *              type: string
 *              description: The challenge ID
 *              example: "challenge_fe888w4561W"
 *            code:
 *              type: string
 *              desription: User supplied code
 *            language:
 *              type: string
 *              description: The programming language the code is written in
 *              example: python
 * 
 *      responses:
 *        200:
 *          description: Success, sends score
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  code:
 *                    type: integer,
 *                    description: Submission score
 *                    example: 20
 */
router.post('/api/submit', function (req, res, next) {
    const rce_request_body = {
        "challenge_id": req.body["challenge_id"],
        code: req.body.code,
        language: req.body.language
    }

    const strategyToUse = req.body.strategy
    const secondsLeft = req.body.secondsLeft

    const rce_request_options = {
        // Pour athentification
        // Authorization: `Bearer ${localStorage.getItem("gacela-token")}`,
        // pour specifier le format de reponse
        headers: { "Content-Type": "application/json" }
    };

    axios.post(process.env.RCE_ENDPOINT, rce_request_body, rce_request_headers)
        .then(resp => {
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
            switch (strategyToUse) {
                case "FASTEST":
                    TheResultedScore = fastestStrategy({ testResults: resp["test_results"], timeLeft: secondsLeft })
                    break;
                case "OPTIMIZED":
                    TheResultedScore = mostOptimizedStrategy({ testResults: resp["test_results"] })
                    break;
                case "SUCCESS_RATIO":
                    TheResultedScore = numberOfTestPassedStrategy({ testResults: resp["test_results"] })
                    break;
                default:
                    throw new Error("UNKNOWN Test STRATEGY !");
            }

            sendResponse(res, 200, true, { score: TheResultedScore, calculatedAt: new Date() })
        })
        .catch(err => {
            sendResponse(res, 500, false, err.message)
        })


});

module.exports = router;
