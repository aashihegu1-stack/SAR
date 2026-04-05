---
layout: opencs
title: PirateMegaGame, Aashi Hegu, Samaghna Deshatty, Rohit Datla
permalink: /gamify/PirateMegaGame
---

<div id="gameContainer">
    <div id="promptDropDown" class="promptDropDown" style="z-index: 9999"></div>
    <!-- GameEnv will create canvas dynamically -->
</div>

<script type="module">
    // Adnventure Game assets locations
    import Core from "{{site.baseurl}}/assets/js/GameEnginev1.1/essentials/Game.js";
    import GameControl from "{{site.baseurl}}/assets/js/GameEnginev1.1/essentials/GameControl.js";
    import GameLevelPirateHunt from "{{site.baseurl}}/assets/js/GameEnginev1.1/GameLevelPirateHuntV1.js";
    import Refurbishing from "{{site.baseurl}}/assets/js/GameEnginev1.1/Refurbishing.js";
    import MarketPirateGame from "{{site.baseurl}}/assets/js/GameEnginev1.1/MarketPirateGame.js";
    import { pythonURI, javaURI, fetchOptions } from "{{site.baseurl}}/assets/js/api/config.js";
   

    const gameLevelClasses = [MarketPirateGame, Refurbishing, GameLevelPirateHunt];

    // Web Server Environment data
    const environment = {
        path:"{{site.baseurl}}",
        pythonURI: pythonURI,
        javaURI: javaURI,
        fetchOptions: fetchOptions,
        gameContainer: document.getElementById("gameContainer"),
        gameLevelClasses: gameLevelClasses

    }
    // Launch Adventure Game using the central core and adventure GameControl
    Core.main(environment, GameControl);
</script>
