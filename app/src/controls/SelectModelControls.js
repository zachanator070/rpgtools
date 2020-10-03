import * as THREE from 'three';
import {SubdivisionModifier} from "three/examples/jsm/modifiers/SubdivisionModifier";
import {MeshBasicMaterial, Vector3} from "three";

export class SelectModelControls {

    constructor(renderRoot, camera, scene, selectControls, selectCallback) {
        this.renderRoot = renderRoot;
        this.camera = camera;
        this.scene = scene;
        this.selectControls = selectControls;
        this.callback = selectCallback;
    }

    constructGlow = () => {

        if(this.glow){
            this.scene.remove(this.glow);
        }
        if(!this.selectControls.selectedMeshedModel){
            return;
        }
        const bbox = new THREE.Box3().setFromObject(this.selectControls.selectedMeshedModel.mesh);
        const geometry = new THREE.BoxGeometry(
            bbox.getSize().z,
            bbox.getSize().y,
            bbox.getSize().x,
            2,
            2,
            2
        );

        const vertexShader = `
        uniform vec3 viewVector;
        uniform float c;
        uniform float p;
        varying float intensity;
        void main() 
        {
            vec3 vNormal = normalize( normalMatrix * normal );
            vec3 vNormel = normalize( normalMatrix * viewVector );
            intensity = pow( c - dot(vNormal, vNormel), p );
       
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
        `;

        const fragmentShader = `
            uniform vec3 glowColor;
            varying float intensity;
            void main()
            {
                vec3 glow = glowColor * intensity;
                gl_FragColor = vec4( glow, 1.0 );
            }
        `;
        const customMaterial = new THREE.ShaderMaterial(
            {
                uniforms:
                    {
                        "c":   { type: "f", value: 1 },
                        "p":   { type: "f", value: 2 },
                        glowColor: { type: "c", value: new THREE.Color(0xffff00) },
                        viewVector: { type: "v3", value: this.camera.position }
                    },
                vertexShader,
                fragmentShader,
                side: THREE.FrontSide,
                blending: THREE.AdditiveBlending,
                transparent: true
            }
        );

        customMaterial.side = THREE.BackSide;

        const modifier = new SubdivisionModifier( 2);
        modifier.modify( geometry );

        this.glow = new THREE.Mesh(geometry, new MeshBasicMaterial({
            color: new THREE.Color(0xffff00),
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true

        }));
        this.glow.position.set(
            this.selectControls.selectedMeshedModel.mesh.position.x,
            0,
            this.selectControls.selectedMeshedModel.mesh.position.z
        );
        this.glow.lookAt(new Vector3(
            this.selectControls.selectedMeshedModel.positionedModel.lookAtX,
            0,
            this.selectControls.selectedMeshedModel.positionedModel.lookAtZ,
        ));
        this.glow.position.set(
            this.selectControls.selectedMeshedModel.mesh.position.x,
            this.glow.geometry.parameters.height/2 + .03,
            this.selectControls.selectedMeshedModel.mesh.position.z
        );
        this.scene.add(this.glow);
    }

    select = async () => {
        if(!this.selectControls.selectedMeshedModel){
            return;
        }
        this.constructGlow();
        await this.callback(this.selectControls.selectedMeshedModel.positionedModel);
        this.selectControls.clearSelection();
    }

    enable = () => {
        this.selectControls.enable();
        this.renderRoot.addEventListener('mousedown', this.select);
    }

    disable = () => {
        this.selectControls.disable();
        this.tearDown();
    }

    tearDown = () => {
        this.selectControls.tearDown();
        if(this.glow){
            this.scene.remove(this.glow);
        }
        this.renderRoot.removeEventListener('mousedown', this.select);
    }

}