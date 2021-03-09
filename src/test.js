//test first place
function test_score_first_place_consistent(scores) {
    for (let i = 0; i < scores.length; i++) {
        scores[i]['cdr.eionet.europa.eu'].score = 3000;
    }
    return scores;
}

function test_score_first_place_not_consistent(scores) {
    for (let i = 0; i < scores.length - 1; i++) {
        scores[i]['cdr.eionet.europa.eu'].score = 3000;
    }
    return scores;
}

//test url entered top 5
function test_score_entered_top_five_consistent(scores) {
    for (let i = 0; i < scores.length; i++) {
        scores[i]['cdr.eionet.europa.eu'].score = 1500;
    }
    return scores;
}

function test_score_entered_top_five_not_consistent(scores) {
    for (let i = 0; i < scores.length - 1; i++) {
        scores[i]['cdr.eionet.europa.eu'].score = 1500;
    }
    return scores;
}

// test url exited top 5
function test_score_exited_top_five_consistent(scores) {
    for (let i = 0; i < scores.length; i++) {
        scores[i]['reportnet.europa.eu'].score = 30;
    }
    return scores;
}

function test_score_exited_top_five_not_consistent(scores) {
    for (let i = 0; i < scores.length - 1; i++) {
        scores[i]['reportnet.europa.eu'].score = 30;
    }
    return scores;
}

// test url score above median
function test_score_above_median_consistent(scores) {
    for (let i = 0; i < scores.length; i++) {
        scores[i]['maps-corda.eea.europa.eu'].score = 1100;
    }
    return scores;
}

function test_score_above_median_not_consistent(scores) {
    for (let i = 0; i < scores.length - 1; i++) {
        scores[i]['maps-corda.eea.europa.eu'].score = 1100;
    }
    return scores;
}


//test url score below median
function test_score_below_median_consistent(scores) {
    for (let i = 0; i < scores.length; i++) {
        scores[i]['land.copernicus.eu'].score = 0;
    }
    return scores;
}

function test_score_below_median_not_consistent(scores) {
    for (let i = 0; i < scores.length - 1; i++) {
        scores[i]['land.copernicus.eu'].score = 0;
    }
    return scores;
}

// test url bottom five
function test_score_bottom_five_consistent(scores) {
    for (let i = 0; i < scores.length; i++) {
        scores[i]['www.eea.europa.eu'].score = 0;
    }
    return scores;
}

function test_score_bottom_five_not_consistent(scores) {
    for (let i = 0; i < scores.length - 1; i++) {
        scores[i]['www.eea.europa.eu'].score = 0;
    }
    return scores;
}

module.exports={
    test_score_first_place_consistent,
    test_score_first_place_not_consistent,
    test_score_entered_top_five_consistent,
    test_score_entered_top_five_not_consistent,
    test_score_exited_top_five_consistent,
    test_score_exited_top_five_not_consistent,
    test_score_above_median_consistent,
    test_score_above_median_not_consistent,
    test_score_below_median_consistent,
    test_score_below_median_not_consistent,
    test_score_bottom_five_consistent,
    test_score_bottom_five_not_consistent
}