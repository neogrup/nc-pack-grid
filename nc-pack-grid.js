import { PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import '@neogrup/nc-items-grid/nc-items-grid.js';
import '@neogrup/nc-products-grid/nc-products-grid.js';
// import { flush } from '@polymer/polymer/lib/legacy/polymer.dom.js';

class NcPacksGrid extends PolymerElement {
  static get template() {
    return html`
      <style>
        .optionsContainer{
          width: 100%;
          height: var(--options-container-height);
        }

        .elementsContainer{
          width: 100%;
          height: calc(100% - var(--options-container-height));
        }

      </style>

      <div class="optionsContainer">
        <nc-items-grid 
            id="gridPacksOptions" 
            language="{{language}}" 
            items-grid-data="{{packOptions}}" 
            loading="{{itemsGridLoading}}" 
            keep-item-selected is-paginated
            auto-flow
            item-height="[[heightPacksGridItems]]"
            item-width="[[widthPacksGridItems]]"
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
            loading="{{itemsGridLoading}}" 
            animations ="[[animations]]"
            on-product-selected="_packElementSelected">
        </nc-products-grid>
      </div>
    `;
  }

  static get properties() {
    return {
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
        observer: '_packOptionCodeSelected'
      },
      packElementsGridData: {
        type: Array,
      },
      language: String,
      breadcrumb: {
        type: Boolean,
        value: false
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
  
  setOptions(packOptions){
    this.set('packElementsGridData',[]);
    this.set('packOptions',[]);
    if (packOptions){
      let packOptionsFiltered = packOptions.filter(this.checkOptionVisible);
      this.set('packOptions',packOptionsFiltered);
      this.selectDefaultOption();
    }
  }

  checkOptionVisible(packOption){
    return (packOption.hasOwnProperty('visible') ? false: true);
  }

  selectDefaultOption(){
    let i;
    let packOptionSelected;
    let packOptionCompleted;
    packOptionSelected = false;
    packOptionCompleted = true;

    // console.log('lineDocSelected', this.lineDocSelected)
    // console.log('packOptionCodeSelected', this.packOptionCodeSelected)
    // console.log('packCompleted', this.packCompleted)
    // console.log(this.packOptions)
    if (this.lineDocSelected.type === 'packLine'){
      for (i in this.packOptions){
        if (this.packOptions[i].code === this.lineDocSelected.elementPack) {
          packOptionSelected = true;
          this.packOptionCodeSelected = this.packOptions[i].code;
          this.packElementsGridData = this.packOptions[i].content;
          break;
        }
      }
      
    } else {

      for (i in this.packOptions){
        if (this.packOptions[i].code === this.packOptionCodeSelected) {

          // console.log(this.packOptions[i])

          if ((this.packOptions[i].minQty >= 1) && (this.packOptions[i].maxQty !== this.packOptions[i].used) && (this.packOptions[i].visible != false)){
            packOptionSelected = true;
            this.packOptionCodeSelected = this.packOptions[i].code;
            this.packElementsGridData = this.packOptions[i].content;
            packOptionCompleted = false;
            break;
          } else {
            if (this.packOptions[i].hasOwnProperty('behaviour')){
              if ((this.packOptions[i].behaviour === 'PAUSA') && (this.packOptions[i].maxQty !== this.packOptions[i].used)){
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
          if ((this.packOptions[i].minQty >= 1) && (this.packOptions[i].maxQty !== this.packOptions[i].used) && (this.packOptions[i].visible != false)){
            packOptionSelected = true;
            this.packOptionCodeSelected = this.packOptions[i].code;
            this.packElementsGridData = this.packOptions[i].content;
            break;
          } else {
            if (this.packOptions[i].hasOwnProperty('behaviour')){
              if ((this.packOptions[i].behaviour === 'PAUSA') && (this.packOptions[i].maxQty !== this.packOptions[i].used)){
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
  }

  _packElementSelected(item){
    this.dispatchEvent(new CustomEvent('pack-line-selected', {detail: {product: item.detail, packOptionCodeSelected: this.packOptionCodeSelected}, bubbles: true, composed: true }));
  }

  _heightPackButtonsChanged(){
    let optionsContainerHeight = parseInt(this.heightPacksGridItems) + 20;
    this.updateStyles({'--options-container-height':   optionsContainerHeight + 'px' });
  }
}

window.customElements.define('nc-pack-grid', NcPacksGrid);
