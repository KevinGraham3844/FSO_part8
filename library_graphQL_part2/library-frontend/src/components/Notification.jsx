const style = {
    backgroundColor: "#EEEEEE",
    borderColor: "green",
    borderStyle: "solid",
    fontWeight: "bold"
}

const Notification = ({ message }) => {
    if (message === null) {
        return null
    }
    return (
        <div style={style}>
            {message}
        </div>
    )
}

export default Notification