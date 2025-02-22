import customElement from "@ui5/webcomponents-base/dist/decorators/customElement.js";
import event from "@ui5/webcomponents-base/dist/decorators/event.js";
import property from "@ui5/webcomponents-base/dist/decorators/property.js";
import slot from "@ui5/webcomponents-base/dist/decorators/slot.js";
import { getI18nBundle } from "@ui5/webcomponents-base/dist/i18nBundle.js";
import type I18nBundle from "@ui5/webcomponents-base/dist/i18nBundle.js";
import Integer from "@ui5/webcomponents-base/dist/types/Integer.js";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState.js";
import ListItemType from "@ui5/webcomponents/dist/types/ListItemType.js";
import Button from "@ui5/webcomponents/dist/Button.js";
import Input from "@ui5/webcomponents/dist/Input.js";
import Label from "@ui5/webcomponents/dist/Label.js";
import Link from "@ui5/webcomponents/dist/Link.js";
import ProgressIndicator from "@ui5/webcomponents/dist/ProgressIndicator.js";
import ListItem from "@ui5/webcomponents/dist/ListItem.js";
import getFileExtension from "@ui5/webcomponents-base/dist/util/getFileExtension.js";
import { renderFinished } from "@ui5/webcomponents-base/dist/Render.js";
import { isEnter, isEscape, isSpace } from "@ui5/webcomponents-base/dist/Keys.js";
import UploadState from "./types/UploadState.js";
import "@ui5/webcomponents-icons/dist/refresh.js";
import "@ui5/webcomponents-icons/dist/stop.js";
import "@ui5/webcomponents-icons/dist/edit.js";
import {
	UPLOADCOLLECTIONITEM_CANCELBUTTON_TEXT,
	UPLOADCOLLECTIONITEM_RENAMEBUTTON_TEXT,
	UPLOADCOLLECTIONITEM_ERROR_STATE,
	UPLOADCOLLECTIONITEM_UPLOADING_STATE,
	UPLOADCOLLECTIONITEM_READY_STATE,
	UPLOADCOLLECTIONITEM_RETRY_BUTTON_TEXT,
	UPLOADCOLLECTIONITEM_TERMINATE_BUTTON_TEXT,
	UPLOADCOLLECTIONITEM_EDIT_BUTTON_TEXT,
} from "./generated/i18n/i18n-defaults.js";
import type { IUploadCollectionItem } from "./Interfaces.js";

// Template
import UploadCollectionItemTemplate from "./generated/templates/UploadCollectionItemTemplate.lit.js";

// Styles
import UploadCollectionItemCss from "./generated/themes/UploadCollectionItem.css.js";

/**
 * @class
 *
 * <h3 class="comment-api-title">Overview</h3>
 * A component to be used within the <code>ui5-upload-collection</code>.
 *
 * <h3>ES6 Module Import</h3>
 *
 * <code>import "@ui5/webcomponents-fiori/dist/UploadCollectionItem.js";</code>
 *
 * @constructor
 * @extends ListItem
 * @public
 * @implements {IUploadCollectionItem}
 * @slot {Node[]} default - Hold the description of the <code>ui5-upload-collection-item</code>. Will be shown below the file name.
 * @since 1.0.0-rc.7
 */
@customElement({
	tag: "ui5-upload-collection-item",
	languageAware: true,
	styles: [ListItem.styles, UploadCollectionItemCss],
	template: UploadCollectionItemTemplate,
	dependencies: [
		...ListItem.dependencies,
		Button,
		Input,
		Link,
		Label,
		ProgressIndicator,
	],
})

/**
 * Fired when the file name is clicked.
 * <br><br>
 * <b>Note:</b> This event is only available when <code>fileNameClickable</code> property is <code>true</code>.
 *
 * @public
 */
@event("file-name-click")

/**
 * Fired when the <code>fileName</code> property gets changed.
 * <br><br>
 * <b>Note:</b> An edit button is displayed on each item,
 * when the <code>ui5-upload-collection-item</code> <code>type</code> property is set to <code>Detail</code>.
 *
 * @public
 */
@event("rename")

/**
 * Fired when the terminate button is pressed.
 * <br><br>
 * <b>Note:</b> Terminate button is displayed when <code>uploadState</code> property is set to <code>Uploading</code>.
 *
 * @public
 */
@event("terminate")

/**
 * Fired when the retry button is pressed.
 * <br><br>
 * <b>Note:</b> Retry button is displayed when <code>uploadState</code> property is set to <code>Error</code>.
 *
 * @public
 */
@event("retry")

/**
 * @since 1.0.0-rc.8
 *
 * @private
 */
@event("_focus-requested")

/**
 * @private
 */
@event("_uci-delete")
class UploadCollectionItem extends ListItem implements IUploadCollectionItem {
	/**
	 * Holds an instance of <code>File</code> associated with this item.
	 *
	 * @default null
	 * @public
	 */
	@property({ type: Object, noAttribute: true, defaultValue: null })
	file?: File | null;

	/**
	 * The name of the file.
	 *
	 * @default ""
	 * @public
	 */
	@property()
	fileName!: string;

	/**
	 * If set to <code>true</code> the file name will be clickable and it will fire <code>file-name-click</code> event upon click.
	 *
	 * @default false
	 * @public
	 */
	@property({ type: Boolean })
	fileNameClickable!: boolean;

	/**
	 * Disables the delete button.
	 *
	 * @default false
	 * @public
	 */
	@property({ type: Boolean, noAttribute: false })
	declare disableDeleteButton: boolean;

	/**
	 * By default, the delete button will always be shown, regardless of the <code>ui5-upload-collection</code>'s property <code>mode</code>.
	 * Setting this property to <code>true</code> will hide the delete button.
	 *
	 * @default false
	 * @public
	 */
	@property({ type: Boolean })
	hideDeleteButton!: boolean;

	/**
	 * Hides the retry button when <code>uploadState</code> property is <code>Error</code>.
	 *
	 * @default false
	 * @public
	 */
	@property({ type: Boolean })
	hideRetryButton!: boolean;

	/**
	 * Hides the terminate button when <code>uploadState</code> property is <code>Uploading</code>.
	 *
	 * @default false
	 * @public
	 */
	@property({ type: Boolean })
	hideTerminateButton!: boolean;

	/**
	 * The upload progress in percentage.
	 * <br><br>
	 * <b>Note:</b> Expected values are in the interval [0, 100].
	 *
	 * @default 0
	 * @public
	 */
	@property({ validator: Integer, defaultValue: 0 })
	progress!: number;

	/**
	 * If set to <code>Uploading</code> or <code>Error</code>, a progress indicator showing the <code>progress</code> is displayed.
	 * Also if set to <code>Error</code>, a refresh button is shown. When this icon is pressed <code>retry</code> event is fired.
	 * If set to <code>Uploading</code>, a terminate button is shown. When this icon is pressed <code>terminate</code> event is fired.
	 *
	 * @default "Ready"
	 * @public
	 */
	@property({ type: UploadState, defaultValue: UploadState.Ready })
	uploadState!: `${UploadState}`;

	/**
	 * Indicates if editing.
	 *
	 * @default false
	 * @private
	 */
	@property({ type: Boolean })
	_editing!: boolean;

	/**
	 * A thumbnail, which will be shown in the beginning of the <code>ui5-upload-collection-item</code>.
	 * <br><br>
	 * <b>Note:</b> Use <code>ui5-icon</code> or <code>img</code> for the intended design.
	 *
	 * @public
	 */
	@slot({ type: HTMLElement })
	thumbnail!: Array<HTMLElement>;

	static i18nFioriBundle: I18nBundle;

	static async onDefine() {
		[UploadCollectionItem.i18nFioriBundle] = await Promise.all([
			getI18nBundle("@ui5/webcomponents-fiori"),
			super.onDefine(),
		]);
	}

	/**
	 * @override
	 */
	async onDetailClick() {
		super.onDetailClick();
		this._editing = true;

		await this._initInputField();
	}

	async _initInputField() {
		await renderFinished();

		const inp = this.shadowRoot!.querySelector<Input>("#ui5-uci-edit-input")!;
		inp.value = this._fileNameWithoutExtension;

		await renderFinished();

		const inpFocusDomRef = inp.getFocusDomRef() as HTMLInputElement;
		if (inpFocusDomRef) {
			inpFocusDomRef.focus();
			inpFocusDomRef.setSelectionRange(0, this._fileNameWithoutExtension.length);
		}
	}

	_onDetailKeyup(e: KeyboardEvent) {
		if (isSpace(e)) {
			this.onDetailClick();
		}
	}

	_onInputFocusin(e: FocusEvent) {
		// prevent focusing the whole upload collection item.
		e.stopPropagation();
	}

	_onInputKeyDown(e: KeyboardEvent) {
		if (isEscape(e)) {
			this._onRenameCancel(e);
		} else if (isEnter(e)) {
			this._onRename();
		} else if (isSpace(e)) {
			e.stopImmediatePropagation();
		}
	}

	_onRename() {
		const inp = this.shadowRoot!.querySelector<Input>("#ui5-uci-edit-input")!;
		this.fileName = inp.value + this._fileExtension;
		this.fireEvent("rename");

		this._editing = false;
		this._focus();
	}

	_onRenameKeyup(e: KeyboardEvent) {
		if (isSpace(e)) {
			this._onRename();
		}
	}

	async _onRenameCancel(e: KeyboardEvent) {
		this._editing = false;

		if (isEscape(e)) {
			await renderFinished();
			this.shadowRoot!.querySelector<Button>(`#${this._id}-editing-button`)!.focus();
		} else {
			this._focus();
		}
	}

	_onRenameCancelKeyup(e: KeyboardEvent) {
		if (isSpace(e)) {
			this._onRenameCancel(e);
		}
	}

	_focus() {
		this.fireEvent("_focus-requested");
	}

	_onFileNameClick() {
		this.fireEvent("file-name-click");
	}

	_onRetry() {
		this.fireEvent("retry");
	}

	_onRetryKeyup(e: KeyboardEvent) {
		if (isSpace(e)) {
			this._onRetry();
		}
	}

	_onTerminate() {
		this.fireEvent("terminate");
	}

	_onTerminateKeyup(e: KeyboardEvent) {
		if (isSpace(e)) {
			this._onTerminate();
		}
	}

	_onDelete() {
		this.fireEvent("_uci-delete");
	}

	getFocusDomRef() {
		return this.getDomRef();
	}

	/**
	 * @override
	 */
	get classes() {
		const result = super.classes;

		return {
			main: {
				...result.main,
				"ui5-uci-root": true,
				"ui5-uci-root-editing": this._editing,
				"ui5-uci-root-uploading": this.uploadState === UploadState.Uploading,
			},
		};
	}

	/**
	 * @override
	 */
	get renderUploadCollectionDeleteButton() {
		return !this.hideDeleteButton;
	}

	get _fileNameWithoutExtension() {
		return this.fileName.substring(0, this.fileName.length - this._fileExtension.length);
	}

	get _fileExtension() {
		return getFileExtension(this.fileName);
	}

	get _renameBtnText() {
		return UploadCollectionItem.i18nFioriBundle.getText(UPLOADCOLLECTIONITEM_RENAMEBUTTON_TEXT);
	}

	get _cancelRenameBtnText() {
		return UploadCollectionItem.i18nFioriBundle.getText(UPLOADCOLLECTIONITEM_CANCELBUTTON_TEXT);
	}

	get _showProgressIndicator() {
		return this.uploadState !== UploadState.Complete;
	}

	get _progressText() {
		if (this.uploadState === UploadState.Uploading) {
			return UploadCollectionItem.i18nFioriBundle.getText(UPLOADCOLLECTIONITEM_UPLOADING_STATE);
		}

		if (this.uploadState === UploadState.Error) {
			return UploadCollectionItem.i18nFioriBundle.getText(UPLOADCOLLECTIONITEM_ERROR_STATE);
		}

		return UploadCollectionItem.i18nFioriBundle.getText(UPLOADCOLLECTIONITEM_READY_STATE);
	}

	get _showRetry() {
		return !this.hideRetryButton && this.uploadState === UploadState.Error;
	}

	get _showTerminate() {
		return !this.hideTerminateButton && this.uploadState === UploadState.Uploading;
	}

	get _retryButtonTooltip() {
		return UploadCollectionItem.i18nFioriBundle.getText(UPLOADCOLLECTIONITEM_RETRY_BUTTON_TEXT);
	}

	get _terminateButtonTooltip() {
		return UploadCollectionItem.i18nFioriBundle.getText(UPLOADCOLLECTIONITEM_TERMINATE_BUTTON_TEXT);
	}

	get _editButtonTooltip() {
		return UploadCollectionItem.i18nFioriBundle.getText(UPLOADCOLLECTIONITEM_EDIT_BUTTON_TEXT);
	}

	get valueStateName(): ValueState {
		if (this.uploadState === UploadState.Error) {
			return ValueState.Error;
		}

		if (this.uploadState === UploadState.Ready || this.uploadState === UploadState.Uploading) {
			return ValueState.Information;
		}

		return ValueState.None;
	}

	/**
	 * override
	 */
	get typeDetail() {
		return false;
	}

	get showEditButton() {
		return this.type === ListItemType.Detail;
	}
}

UploadCollectionItem.define();

export default UploadCollectionItem;
