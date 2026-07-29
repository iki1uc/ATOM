export const ATOM = {

    core: "ATOM.core",
    spin: 0,
    bond: [],
    state: "stable",

    init(){
        this.spin = Math.random() * 360;
        this.state = "stable";
        return this;
    },

    excite(level = 1){
        this.spin += level * 45;
        this.state = "excited";
        return this;
    },

    stabilize(){
        this.spin = this.spin % 360;
        this.state = "stable";
        return this;
    },

    connect(target){
        this.bond.push(target);
        return this;
    },

    info(){
        return {
            core: this.core,
            spin: this.spin,
            state: this.state,
            bonds: this.bond.length
        };
    }
};
