let TimeSheet = () => {
    return new Promise((resolve, reject) => {
        setTimeout(()=> {
            resolve(["Yo ok"]);
        }, 1000);//simulate server delay
    });
};

module.exports = {
    timeSheet : TimeSheet
};