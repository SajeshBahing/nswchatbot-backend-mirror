function randomTime(start, end) {
    // get the difference between the 2 dates, multiply it by 0-1, 
    // and add it to the start date to get a new date 
    var diff = end.getTime() - start.getTime();
    var new_diff = diff * Math.random();
    var date = new Date(start.getTime() + new_diff);
    return date;
}

let TimeSheet = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            let date = randomTime(new Date('2019-12-01 09:00:00'), new Date('2019-12-01 17:00:00'));

            resolve(date.toLocaleString());
        }, 1000);//simulate server delay
    });
};

module.exports = {
    timeSheet: TimeSheet
};