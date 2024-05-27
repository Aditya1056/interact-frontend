
export const formatDate = (date) => {

    let formattedDate = "";

    const messageDate = new Date(date);
    const currentDate = new Date();

    if((currentDate.getTime()-messageDate.getTime()) < (1000*60*60*24)){
        let hours = messageDate.getHours();
        let minutes = messageDate.getMinutes();
        let ampm = hours >= 12 ? 'pm' : 'am'; 
        minutes = minutes < 10 ? '0'+minutes : minutes;
        hours = hours % 12;
        hours = hours ? hours : 12;
        formattedDate = hours + ':' + minutes + ' ' + ampm;
    }
    else if((currentDate.getTime()-messageDate.getTime()) < (1000*60*60*48)){
        formattedDate = "a day ago";
    }
    else{
        formattedDate = messageDate.getDate() + '/' + (messageDate.getMonth()+1) + '/' + messageDate.getFullYear();
    }

    return formattedDate;
}

export const formatMessageDate = (date) => {

    let formattedDate = "";

    const messageDate = new Date(date);

    let hours = messageDate.getHours();
    let minutes = messageDate.getMinutes();
    let ampm = hours >= 12 ? 'pm' : 'am'; 
    minutes = minutes < 10 ? '0'+minutes : minutes;
    hours = hours % 12;
    hours = hours ? hours : 12;
    formattedDate = hours + ':' + minutes + ' ' + ampm;
    formattedDate +=  ', ' + messageDate.getDate() + '/' + (messageDate.getMonth()+1) + '/' + messageDate.getFullYear();

    return formattedDate;
}

export const formatUserProfileDate = (date) => {

    let formattedDate = "";

    const monthsArr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const currentDate = new Date(date);

    let day = currentDate.getDate();

    if(day < 10){
        day = '0' + day;
    }

    const month = currentDate.getMonth();

    const year = currentDate.getFullYear();

    formattedDate = day + ' ' + monthsArr[month] + ', ' + year;

    return formattedDate;
}