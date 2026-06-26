const func = async() => {
    let answer = await window.api.ping();
    console.log(answer)
}

func()