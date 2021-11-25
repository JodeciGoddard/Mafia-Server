
class Role {

    constructor(type) {
        this.type = type;
        this.initailise();
    }

    initailise() {
        switch (this.type) {
            case "mafia":
                this.description = "This is mafia";
                break;
            case "doctor":
                this.description = "This is doc";
                break;
            case "cop":
                this.description = "This is cop";
                break;
            case "civilian":
                this.description = "This is a civi";
                break;
        }
    }


}

export default Role;