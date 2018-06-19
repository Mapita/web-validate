function englishList(items, conjunction = "and"){
    if(!items || !items.length){
        return "";
    }else if(items.length === 1){
        return String(items[0]);
    }else if(items.length === 2){
        return `${items[0]} ${conjunction} ${items[1]}`;
    }else{
        return (
            items.slice(0, items.length - 1).join(", ") +
            `, ${conjunction} ${items[items.length - 1]}`
        );
    }
}

module.exports = englishList;
