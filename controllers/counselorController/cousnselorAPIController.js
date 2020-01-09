let TimeSheet = (date, time) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            var hour = time.split(":")[0];

            resolve( hour >= 9 && hour <= 17 );

        }, 2000);//simulate server delay
    });
};

module.exports = {
    timeSheet: TimeSheet
};