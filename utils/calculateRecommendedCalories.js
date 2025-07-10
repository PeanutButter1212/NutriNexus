export const calculateRecommendedCalories = (weight, height, age, gender) => {
 

    let userBMR = 0 

    const heightInMetres = height / 100 

    if (gender == "Male") {
        if (age >= 18 && age <= 29) {
            userBMR = (14.4 * weight) + (313 * heightInMetres) + 113;
        } else if (age >= 30 && age <= 59) {
            userBMR = (11.4 * weight) + (541 * heightInMetres) - 137;
        } else if (age >= 60)  {
            userBMR = (11.4 * weight) + (541 * heightInMetres) - 256;
        }
    } else if (gender == "Female") {
        if (age >= 18 && age <= 29) {
            userBMR = (10.4 * weight) + (615 * heightInMetres) - 282;
        } else if (age >= 30 && age <= 59){
            userBMR = (8.18 * weight) + (502 * heightInMetres) - 11.6;
        } else if (age > 60) {
            userBMR = (8.52 * weight) + (421 * heightInMetres) - 10.7;
        }
    }

    const activityMultiplier = 1.375 

    console.log("userBMR: " + userBMR)
    const maintenanceCalories = userBMR * activityMultiplier

    const roundedMaintenanceCalories = Math.round(maintenanceCalories / 10) * 10;

    return roundedMaintenanceCalories

}