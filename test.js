let list = [1,2,3,4]
function  bbb(list){
    list.forEach((item,index)=>{
        list[index] = 0
    })
}
bbb(list)
console.log(list)