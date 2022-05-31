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
 *              example: def add(a, b)
 *                      return a + b
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
 *                  score:
 *                    type: integer,
 *                    description: Submission score
 *                    example: 20
 *                  createdAt:
 *                    type: string
 *                    description: time of calculation
 *                    example: 2022-05-27T23:33:21.612Z
 */
router.post('/api/submit', function (req, res, next) {
    const rce_request_body = {
        "challenge_id": req.body["challenge_id"],
        code: req.body.code,
        lang: req.body.language
    }

    const strategyToUse = req.body.strategy
    const secondsLeft = req.body.secondsLeft

    const rce_request_headers = {
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
                    // console.log(resp.data["test_results"])
                    TheResultedScore = fastestStrategy({ testResults: resp.data["test_results"], timeLeft: secondsLeft })
                    break;
                case "OPTIMIZED":
                    TheResultedScore = mostOptimizedStrategy({ testResults: resp.data["test_results"] })
                    break;
                case "SUCCESS_RATIO":
                    TheResultedScore = numberOfTestPassedStrategy({ testResults: resp.data["test_results"] })
                    break;
                default:
                    throw new Error("UNKNOWN Test STRATEGY !");
            }

            sendResponse(res, 200, true, { score: TheResultedScore, calculatedAt: new Date().toISOString() })
        })
        .catch(err => {
            console.error(err)
            sendResponse(res, 500, false, err.message)
        })


});

module.exports = router;
