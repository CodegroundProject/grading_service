const  sendResponse = (res,statusCode , isSuccess , responseBody)=>{
    res.setHeader('Content-Types', 'application/json');
    res.statusCode = statusCode;
    res.json({success : isSuccess , data: responseBody});
}

// Seconds left
const  fastestStrategy=({ testResults , timeLeft })=>{
    let failedTimes = testResults.filter(test=>test.status=== "failed").length
    if(failedTimes> 0){
        return 0
    }else{
        return timeLeft
    }
}


// ( ( SUCCEDED/ALL ) *100 * ( 1/ sum(correct tests times) ) )
const mostOptimizedStrategy=({testResults})=>{
    let passedTests=testResults.filter(test=>test.status==="passed")

    const sumCorrectTestsTimes = passedTests.reduce((totalTime, test) => {
        return totalTime + test.time;
    }, 0);

    return 100 *  ( (passedTests.length / testResults.length) * ( 1 / sumCorrectTestsTimes) );
}

// Percent of number of succeded Tests
const numberOfTestPassedStrategy=({testResults})=>{
    let passedTestsNumber = testResults.filter(test=>test.status==="passed").length

    return ( passedTestsNumber/ testResults.length)*100
}


module.exports={
    sendResponse : sendResponse,
    fastestStrategy : fastestStrategy,
    mostOptimizedStrategy : mostOptimizedStrategy,
    numberOfTestPassedStrategy : numberOfTestPassedStrategy
};
