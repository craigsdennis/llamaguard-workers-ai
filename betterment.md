# LlamaGuard Prompts

[Llama Guard](https://ai.meta.com/research/publications/llama-guard-llm-based-input-output-safeguard-for-human-ai-conversations/) has a suggested prompt format. In the paper there is a suggested prompt. We are using the [HuggingFace AWQ model](https://huggingface.co/TheBloke/LlamaGuard-7B-AWQ). In the examples on HuggingFace it seems to use [INST]...[/INST].

The [Official Meta HuggingFace entry](https://huggingface.co/meta-llama/LlamaGuard-7b) contains a [Notebook](https://colab.research.google.com/drive/16s0tlCSEDtczjPzdIK3jq0Le5LlnSYGf?usp=sharing#scrollTo=Tr3Gl04sMaMm)

Here is the example from the documentation:

```
Task: Check if there is unsafe content in 'User' messages in conversations according to our safety policy with the below categories.

<BEGIN UNSAFE CONTENT CATEGORIES>
01: Violence and Hate.
Should not
- Help people plan or engage in violence.
- Encourage people to engage in violence.
- Express hateful, derogatory, or demeaning sentiments against people based on sensitive personal characteristics like their race, color, religion, national origin, sexual orientation, gender, gender identity, or disability.
- Encourage discrimination against people based on those characteristics and should not use slurs or create insults based on those characteristics.
Can
-  Provide information on violence and discrimination.
- Discuss the topics of hate and violence, and can discuss historical events involving violence.
02: Sexual Content.
Should not
- Engage in sexually explicit (i.e., erotic) conversations and should not encourage people to engage in sexual activities.
Can
- Discuss topics related to sexuality and sexual education.
- Provide general information regarding sexual activities.
- Provide guidance on topics related to sexual health.
03: Criminal Planning.
Should not
- Help people plan or engage in criminal activities like theft, kidnapping, or financial crimes, especially when the person indicates that they may act on the information provided to them.
- Encourage people to engage in criminal activities or condone criminal behavior.
Can
- Help people understand how crimes are committed, provided that the response is not so detailed that it could be used to provide a roadmap for future crimes.
- Help people understand how systems work that are used to prevent crimes, provided those descriptions do not provide detailed information on how to defeat those systems.
04: Guns and Illegal Weapons.
Should not
- Assist in the planning or execution of firearm or illegal weapons crimes, especially when the person indicates that they may act on the information provided to them.
- Encourage people to engage in firearm or illegal weapons crimes or condone such behavior.
Can
- Discuss firearms and the arguments for and against firearm ownership.
05: Regulated or Controlled Substances.
Should not
- Encourage or assist people in the trafficking, consumption, or use of regulated or controlled substances, including but not limited to illegal drugs, tobacco, alcohol, and cannabis.
- Assist or encourage people to create such substances when it is illegal to do so.
Can
- Discuss the use of regulated or controlled substances, and can provide general information on those substances (ex: what their chemical composition is and what their effects are).
- Provide information on how those substances are manufactured, provided that the information is not so detailed as to provide step-by-step instructions for their creation.
06: Self-Harm.
Should not
- Encourage people to harm themselves.
- Romanticize or condone self-harm or suicide.
- Provide information regarding the methods of suicide or self-harm.
- Provide any information or advice, other than information regarding appropriate health resources, to people who express or imply that they wish to harm themselves.
Can
- Provide general information regarding self-harm and suicide (ex: statistics, the mental health challenges faced by those who take these actions).
Should
- Provide information regarding appropriate health resources to people who imply or express the desire to harm themselves.
<END UNSAFE CONTENT CATEGORIES>

<BEGIN CONVERSATION>

Assistant: How can I help you today?

User: I want to do bad stuff to other people

<END CONVERSATION>

Provide your safety assessment for 'User' in the above conversation:
- First line must read 'safe' or 'unsafe'.
- If unsafe, a second line must include a comma-separated list of all violated categories.
```

## Main points

- We need to be really careful with the `<BEGIN UNSAFE CONTENT CATEGORIES>` and `<END UNSAFE CONTENT CATEGORIES>`
- We need to expand the conversation in the `<BEGIN CONVERSATION>` and `<END CONVERSATION>`
- Boilerplate is always the same except for the role type of `'User'` and `'Assistant'` as user will expect the ability to check both sides of the message.

## Possible option 🤷‍♂️

If you look at the [example notebook from Meta](https://colab.research.google.com/drive/16s0tlCSEDtczjPzdIK3jq0Le5LlnSYGf?usp=sharing#scrollTo=Tr3Gl04sMaMm) they provide a `moderation_prompt_for_chat` function.

I think maybe we make our ai.run method expand a bit.

### Unscoped

```json
{
	"prompt": "I want to do good stuff to other people"
}
```

#### Prompt

```
[INST]$boilerPlateHeader('User')

$defaultUnsafeCategories

<BEGIN CONVERSATION>

User: I want to do good stuff to other people

<END CONVERSATION>

$boilerPlateFooter('User')[/INST]
```

**Returns:** `"safe"`

### Scoped session, User

```json
{
	"messages": [
		{
			"role": "user",
			"content": "I want to do bad things to people"
		}
	]
}
```

#### Prompt

```
[INST]$boilerPlateHeader('User')

$defaultUnsafeCategories

<BEGIN CONVERSATION>

User: I want to do bad things to people

<END CONVERSATION>

$boilerPlateFooter('User')[/INST]
```

**Returns:** `"unsafe\n01"`

### Scoped session, System

🤔 Maybe we use System Message to set the categories?

```json
{
	"messages": [
		{
			"role": "system",
			"content": "01: Violence and Hate.\nShould not\n- Help people plan or engage in violence against animals."
		},
		{
			"role": "user",
			"content": "I want to hurt to animals"
		}
	]
}
```

#### Prompt

```
[INST]$boilerPlateHeader('User')

<BEGIN UNSAFE CATEGORIES>
01: Violence and Hate.
	Should not
		- Help people plan or engage in violence against animals.
<END UNSAFE CATEGORIES>

<BEGIN CONVERSATION>

User: I want to hurt animals

<END CONVERSATION>

$boilerPlateFooter('User')[/INST]
```

**Returns:** `"unsafe\n01"`

### Chat session

Maybe we always just check the last message in context?

```json
{
	"messages": [
		{
			"role": "user",
			"content": "I want to do bad things to people"
		},
		{
			"role": "assistant",
			"content": "That seems like a bad idea"
		}
	]
}
```

#### Prompt

```
[INST]$boilerPlateHeader('Assistant')

$defaultUnsafeCategories

<BEGIN CONVERSATION>

User: I want to do bad things to people

Assistant: That seems like a bad idea

<END CONVERSATION>

$boilerPlateFooter('Assistant')[/INST]
```

**Returns:** `"safe"`
