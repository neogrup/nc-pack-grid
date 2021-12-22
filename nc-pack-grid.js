import { PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import '@neogrup/nc-items-grid/nc-items-grid.js';
import '@neogrup/nc-products-grid/nc-products-grid.js';
// import { flush } from '@polymer/polymer/lib/legacy/polymer.dom.js';

class NcPacksGrid extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          --pack-grid-item-content-border-radius: 5px;
          --pack-grid-item-content-box-shadow: none;
          --pack-grid-item-content-folder-font-size: 1.3em;
          --pack-grid-item-options-content-default-font-size: 1em;
        }

        nc-items-grid{
          --items-grid-item-content-default-font-size: var(--pack-grid-item-options-content-default-font-size);
        }

        nc-products-grid{
          --products-grid-item-content-border-radius: var(--pack-grid-item-content-border-radius);
          --products-grid-item-content-box-shadow: var(--pack-grid-item-content-box-shadow);
          --products-grid-item-content-folder-font-size: var(--pack-grid-item-content-folder-font-size);
        }


        .optionsContainer{
          width: 100%;
          height: var(--options-container-height);
        }

        .elementsContainer{
          width: 100%;
          height: calc(100% - var(--options-container-height));
        }

      </style>

      <div class="optionsContainer" hidden$="[[hideOptionsContainer]]">
        <nc-items-grid 
            id="gridPacksOptions" 
            language="{{language}}" 
            items-grid-data="{{packOptions}}" 
            loading="{{itemsGridLoading}}" 
            keep-item-selected 
            is-paginated
            auto-flow
            item-height="[[heightPacksGridItemsOptions]]"
            item-width="[[widthPacksGridItemsOptions]]"
            item-margin="[[marginPacksGridItems]]" 
            animations ="[[animations]]"
            on-item-selected="_packOptionSelected">
        </nc-items-grid>
      </div>

      <div class="elementsContainer">
        <nc-products-grid 
            id="gridPacksProducts" 
            language="{{language}}" 
            products-grid-data="{{packElementsGridData}}" 
            height-products-grid-items="[[heightPacksGridItems]]" 
            width-products-grid-items="[[widthPacksGridItems]]" 
            margin-products-grid-items="[[marginPacksGridItems]]"
            view-mode-products-grid-items="[[viewModePacksGridItems]]"
            loading="{{itemsGridLoading}}" 
            animations ="[[animations]]"
            on-product-selected="_packElementSelected"
            on-product-info-selected="_packElementInfoSelected">
        </nc-products-grid>
      </div>
    `;
  }

  static get properties() {
    return {
      packType: String, // pack or modifier
      packLevel: Number, // pack or modifier
      packCompleted:{
        type: Boolean,
        value: false
      },
      packOptions: {
        type: Array,
        value: []
      },
      lineDocSelected: {
        type: Object,
        value: {}
      },
      animations: {
        type: Boolean,
        value: true
      },
      packOptionCodeSelected: {
        type: String,
        observer: '_packOptionCodeSelected',
        notify: true,
      },
      packElementsGridData: {
        type: Array,
      },
      language: String,
      breadcrumb: {
        type: Boolean,
        value: false
      },
      heightPacksGridItemsOptions: {
        type: Number,
        reflectToAttribute: true
      },
      widthPacksGridItemsOptions: {
        type: Number,
        reflectToAttribute: true
      },
      heightPacksGridItems: {
        type: Number,
        reflectToAttribute: true,
        observer: '_heightPackButtonsChanged'
      },
      widthPacksGridItems: {
        type: Number,
        reflectToAttribute: true
      },            
      marginPacksGridItems: {
        type: Number,
        reflectToAttribute: true
      },
      viewModePacksGridItems: {
        type: String,
        reflectToAttribute: true
      }, 
      hideOptionsContainer: {
        type: Boolean,
        value: false
      }
    };
  }

  connectedCallback() {
    super.connectedCallback();
  }

  setPackCompleted(packCompleted){
    this.packCompleted = packCompleted;
  }

  setDocLineSelected(lineDocSelected){
    this.lineDocSelected = lineDocSelected;
  }

  setPackOption(option){
    this.packOptionCodeSelected = option.code;
    this.packElementsGridData = option.content;
  }
  
  setPackType(packType){
    this.set('packType', packType);
  }

  setPackLevel(packLevel){
    this.set('packLevel', packLevel);
  }

  getPackLevel(){
    return this.packLevel;
  }

  setOptions(packOptions){
    if (this.viewModePacksGridItems === 'kiosk'){
      this.hideOptionsContainer = true;
    }

    this.set('packElementsGridData',[]);
    this.set('packOptions',[]);
    if (packOptions){
      let packOptionsFiltered = packOptions.filter(this.checkOptionVisible);
      this.set('packOptions',packOptionsFiltered);

      if (Object.keys(this.lineDocSelected).length === 0){
        this.selectDefaultOption();
      } else {
        this.selectDefaultOptionLineSelected();
      }
    }
  }

  checkOptionVisible(packOption){
    return (packOption.hasOwnProperty('visible') ? false: true);
  }

  selectDefaultOptionLineSelected(){
    let i;
    let packOptionSelected;
    let packOptionCodeSelected;
    let packOptionCompleted;
    packOptionSelected = false;
    packOptionCompleted = true;
    if ((this.lineDocSelected.type === 'packLine') || ((this.lineDocSelected.type !== 'packLine') && (this.lineDocSelected.level > 0))){

      // console.warn('**********************************************');
      // console.log('lineDocSelected', this.lineDocSelected)
      // console.log('packOptionCodeSelected', this.packOptionCodeSelected)

      if (this.packOptionCodeSelected === ""){
        packOptionCodeSelected = this.lineDocSelected.elementPack;
      } else {
        if (this.packOptionCodeSelected === this.lineDocSelected.elementPack){
          packOptionCodeSelected = this.lineDocSelected.elementPack;
        } else {
          packOptionCodeSelected = this.packOptionCodeSelected;
        }
      }

      for (i in this.packOptions){
        if (this.packOptions[i].code === packOptionCodeSelected) {
          packOptionSelected = true;
          this.packOptionCodeSelected = this.packOptions[i].code;
          this.packElementsGridData = this.packOptions[i].content;
          break;
        }
      }
      
    } else {

      let currentOptionIndex;
      if (this.packOptionCodeSelected){
        currentOptionIndex = this.packOptions.findIndex(packOption => packOption.code === this.packOptionCodeSelected);
      }

      for (i in this.packOptions){
        if (this.packOptions[i].code === this.packOptionCodeSelected) {
          if (this.packOptions[i].visible != false){
            packOptionSelected = true;
            this.packOptionCodeSelected = this.packOptions[i].code;
            this.packElementsGridData = this.packOptions[i].content;
            packOptionCompleted = false;
            break;
          } 
        }
      }

      if (packOptionCompleted){
        for (i in this.packOptions){
          if (this.viewModePacksGridItems === 'kiosk'){
            if ((currentOptionIndex) && (i <= currentOptionIndex)) {
              continue;
            }
          }
        }
      }

    }

    if (!packOptionSelected){
      if (this.lineDocSelected.type === 'pack'){
          this.selectDefaultOption();
      } else {
        this.packOptionCodeSelected = this.packOptions[0].code;
        this.packElementsGridData = this.packOptions[0].content;
      }
    }
  }

  selectDefaultOption(){
    let i;
    let packOptionSelected;
    let packOptionCompleted;
    packOptionSelected = false;
    packOptionCompleted = true;

    // console.warn('**********************************************');
    // console.log('lineDocSelected', this.lineDocSelected)
    // console.log('packOptionCodeSelected', this.packOptionCodeSelected)
    // console.log('packCompleted', this.packCompleted)
    // console.log(this.packOptions)
    if ((this.lineDocSelected.type === 'packLine') || ((this.lineDocSelected.type !== 'packLine') && (this.lineDocSelected.level > 0))){
      for (i in this.packOptions){
        if (this.packOptions[i].code === this.lineDocSelected.elementPack) {
          packOptionSelected = true;
          this.packOptionCodeSelected = this.packOptions[i].code;
          this.packElementsGridData = this.packOptions[i].content;
          break;
        }
      }
      
    } else {

      let currentOptionIndex;
      if (this.packOptionCodeSelected){
        currentOptionIndex = this.packOptions.findIndex(packOption => packOption.code === this.packOptionCodeSelected);
      }

      for (i in this.packOptions){

        if (this.packOptions[i].code === this.packOptionCodeSelected) {
          if ((this.packOptions[i].minQty >= 1) && (this.packOptions[i].maxQty !== this.packOptions[i].used) && (this.packOptions[i].visible != false)){
            packOptionSelected = true;
            this.packOptionCodeSelected = this.packOptions[i].code;
            this.packElementsGridData = this.packOptions[i].content;
            packOptionCompleted = false;
            break;
          } else {
            if (this.packOptions[i].hasOwnProperty('behavior')){
              if ((this.packOptions[i].behavior === 'PAUSA') && (this.packOptions[i].maxQty !== this.packOptions[i].used)){
                packOptionSelected = true;
                this.packOptionCodeSelected = this.packOptions[i].code;
                this.packElementsGridData = this.packOptions[i].content;
                packOptionCompleted = false;
                break;
              }
            }
          }
        }
      }

      if (packOptionCompleted){
        for (i in this.packOptions){
          if (this.viewModePacksGridItems === 'kiosk'){
            if ((currentOptionIndex) && (i <= currentOptionIndex)) {
              continue;
            }
          }

          if ((this.packOptions[i].minQty >= 1) && (this.packOptions[i].maxQty !== this.packOptions[i].used) && (this.packOptions[i].visible != false)){
            packOptionSelected = true;
            this.packOptionCodeSelected = this.packOptions[i].code;
            this.packElementsGridData = this.packOptions[i].content;
            break;
          } else {
            if (this.packOptions[i].hasOwnProperty('behavior')){
              if ((this.packOptions[i].behavior === 'PAUSA') && (this.packOptions[i].maxQty !== this.packOptions[i].used)){
                packOptionSelected = true;
                this.packOptionCodeSelected = this.packOptions[i].code;
                this.packElementsGridData = this.packOptions[i].content;
                break;
              }
            }
          }
        }
      }
    }

    if (!packOptionSelected){
      if (Object.keys(this.lineDocSelected).length === 0){
        // this.dispatchEvent(new CustomEvent('close-pack-selection-default', {bubbles: true, composed: true }));
        this.dispatchEvent(new CustomEvent('close-pack-selection', {bubbles: true, composed: true }));
      } else{
        this.packOptionCodeSelected = this.packOptions[0].code;
        this.packElementsGridData = this.packOptions[0].content;
      }
    } 
  }

  _packOptionSelected(option){
    this.packOptionCodeSelected = option.detail.code;
    this.packElementsGridData = option.detail.content;
  }

  _packOptionCodeSelected(option){
    this.$.gridPacksOptions.selectItem(option);
    this.dispatchEvent(new CustomEvent('close-pack-line-actions', { bubbles: true, composed: true }));
  }

  _packElementSelected(item){
    if ((item.detail.usedQty > 0) && (this.viewModePacksGridItems != 'kiosk')){
      this.dispatchEvent(new CustomEvent('open-pack-line-actions', {detail: {product: item.detail, packOptionCodeSelected: this.packOptionCodeSelected, packType: this.packType}, bubbles: true, composed: true }));
    } else {
      this.dispatchEvent(new CustomEvent('pack-line-selected', {detail: {product: item.detail, packOptionCodeSelected: this.packOptionCodeSelected, packType: this.packType}, bubbles: true, composed: true }));
    }
  }

  _heightPackButtonsChanged(){
    let optionsContainerHeight;
    if (this.viewModePacksGridItems === 'kiosk'){
      optionsContainerHeight = ((parseInt(this.heightPacksGridItemsOptions) + parseInt(this.marginPacksGridItems)) * 2) + 50;
    } else {
      optionsContainerHeight = parseInt(this.heightPacksGridItemsOptions) + 20;
    }
    this.updateStyles({'--options-container-height':   optionsContainerHeight + 'px' });
  }

  _packElementInfoSelected(item){
    this.dispatchEvent(new CustomEvent('pack-line-info-selected', {detail: {product: item.detail, packOptionCodeSelected: this.packOptionCodeSelected}, bubbles: true, composed: true }));
  }
}

window.customElements.define('nc-pack-grid', NcPacksGrid);
