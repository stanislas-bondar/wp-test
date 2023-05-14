/**
 * Registers a new block provided a unique name and an object defining its behavior.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-registration/
 */
import { registerBlockType } from '@wordpress/blocks';
import { useState, useEffect } from '@wordpress/element';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * All files containing `style` keyword are bundled together. The code used
 * gets applied both to the front of your site and to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './style.scss';

/**
 * Internal dependencies
 */
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import CustomPostEditor from './custom-post-block';
import CustomPostUpdate from './custom-post-update';
import CustomPostsList from './custom-post-list';


/**
 * Every block starts by registering a new block type definition.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-registration/
 */
registerBlockType('your-namespace/your-custom-post-block', {
	title: 'Your Custom Post Block',
	icon: 'admin-post', // Choose an appropriate icon
	category: 'common',
	supports: {
		html: false,
	},
	attributes: {
		mode: {
			type: 'string',
			default: 'list',
		},
		selectedPostId: {
			type: 'number',
			default: null,
		},
	},

	edit: ({ attributes, setAttributes }) => {
		const { mode, selectedPostId } = attributes;
		const blockProps = useBlockProps();

		const changeMode = (newMode, postId = null) => {
			setAttributes({
				mode: newMode,
				selectedPostId: postId,
			});
		};

		useEffect(() => {
			if (mode === 'list') {
				setAttributes({
					selectedPostId: null,
				});
			}
		}, [mode, setAttributes]);

		return (
			<div {...blockProps}>
				{mode === 'list' && <CustomPostsList onAddNew={() => changeMode('add')} onEdit={(postId) => changeMode('edit', postId)} />}
				{mode === 'add' && <CustomPostEditor onCancel={() => changeMode('list')} />}
				{mode === 'edit' && <CustomPostUpdate postId={selectedPostId} onCancel={() => changeMode('list')} />}
			</div>
		);
	},

	save: () => {
		return null;
	},
});
