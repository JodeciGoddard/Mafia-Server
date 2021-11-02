
class Role {

    constructor(type) {
        this.type = type;
        this.initailise();
    }

    initailise() {
        switch (type) {
            case "mafia":
                this.description = "This is mafia";
                break;
            case "doctor":
                this.description = "";
                break;
            case "cop":
                this.description = "";
                break;
            case "civilian":
                this.description = "";
                break;
        }
    }


}

export default Role;